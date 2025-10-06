import type {
  XtreamUserProfile,
  XtreamServerInfo,
  XtreamCategory,
  XtreamChannel,
  XtreamMoviesListing,
  XtreamProfile,
  XtreamShortEPG,
  XtreamFullEPG,
  XtreamMovie,
  XtreamShowListing,
  XtreamShow,
} from './types.ts';

/**
 * Serializers type definition that specifies transformation functions for each type of API response.
 * These functions allow for custom mapping and transformation of the raw API data into
 * alternative formats or structures as needed.
 */
type Serializers = {
  profile: (input: XtreamUserProfile) => any;
  serverInfo: (input: XtreamServerInfo) => any;
  channelCategories: (input: XtreamCategory[]) => any;
  movieCategories: (input: XtreamCategory[]) => any;
  showCategories: (input: XtreamCategory[]) => any;
  channels: (input: XtreamChannel[]) => any;
  movies: (input: XtreamMoviesListing[]) => any;
  movie: (input: XtreamMovie) => any;
  shows: (input: XtreamShowListing[]) => any;
  show: (input: XtreamShow) => any;
  shortEPG: (input: XtreamShortEPG) => any;
  fullEPG: (input: XtreamFullEPG) => any;
};

/**
 * Partial implementation of Serializers type to allow defining only the needed serializers.
 * This makes it easy to override just a subset of serializers while keeping defaults for others.
 */
type CustomSerializers = Partial<Serializers>;

/**
 * Configuration options for initializing the Xtream API client.
 * @property url - Base URL of the Xtream API server
 * @property username - Username for authentication
 * @property password - Password for authentication
 * @property preferredFormat - Optional preferred streaming format (default: 'ts')
 */
type Options = {
  url: string;
  username: string;
  password: string;
  preferredFormat?: 'ts' | 'm3u8' | 'rtmp';
};

/**
 * Options for requests that support pagination and category filtering.
 * @property categoryId - Optional ID of the category to filter by
 * @property page - Optional page number for pagination
 * @property limit - Optional number of items per page
 */
type FilterableRequest = {
  categoryId?: number | string;
  page?: number;
  limit?: number;
};

/**
 * Options for EPG (Electronic Program Guide) related requests.
 * @property channelId - ID of the channel to get EPG data for
 * @property limit - Optional number of EPG entries to return
 */
type EPGOptions = {
  channelId: number | string;
  limit?: number;
};

/**
 * Options for show information requests.
 * @property showId - ID of the show to retrieve information for
 */
type ShowOptions = {
  showId: number | string;
};

/**
 * Options for movie information requests.
 * @property movieId - ID of the movie to retrieve information for
 */
type MovieOptions = {
  movieId: number | string;
};

/**
 * Parameters for generating a streaming URL.
 * @property type - Type of content to stream ('movie', 'episode', or 'channel')
 * @property streamId - ID of the stream
 * @property extension - File extension/format for the stream
 * @property timeshift - Optional timeshift settings for live TV playback from a specific point in time
 */
export type StreamURLRequest = {
  type: 'movie' | 'episode' | 'channel';
  streamId: number | string;
  extension: string;
  timeshift?: {
    start: Date; // Start time for the timeshift
    duration: number; // Duration in seconds
  };
};

/**
 * Xtream API client for interacting with Xtream compatible IPTV services.
 *
 * This class provides methods to query and retrieve various types of content
 * from an Xtream compatible API, including live channels, movies, TV shows,
 * and EPG data. It also supports custom serialization of API responses.
 *
 * @template T - Type of custom serializers being used
 */
export class Xtream<T extends CustomSerializers = CustomSerializers> {
  // The base URL of the Xtream server (without trailing slash)
  baseUrl: string;

  // The URL of the Xtream API with authentication parameters
  #apiUrl: string;

  // The username for authentication
  #username: string;

  // The password for authentication
  #password: string;

  // The preferred stream format (default: 'ts')
  #format: string = 'ts';

  /**
   * Default serializers that simply return the input without transformation.
   * These can be overridden with custom implementations during initialization.
   */
  #serializers: Serializers = {
    profile: (input) => input,
    serverInfo: (input) => input,
    channelCategories: (input) => input,
    movieCategories: (input) => input,
    showCategories: (input) => input,
    channels: (input) => input,
    movies: (input) => input,
    movie: (input) => input,
    shows: (input) => input,
    show: (input) => input,
    shortEPG: (input) => input,
    fullEPG: (input) => input,
  };

  /**
   * Indicates the type of serializer being used (e.g., 'none', 'standardized', 'jsonapi')
   * Used for diagnostic and informational purposes.
   */
  serializerType = 'none';

  /**
   * Cached user profile information to avoid repeated API calls.
   * This is populated on first use when needed and contains information
   * about user permissions, allowed formats, etc.
   */
  userProfile?: XtreamUserProfile;

  /**
   * Creates a new instance of the Xtream service.
   *
   * @param options - Configuration options for the Xtream client
   * @param options.url - The base URL of the Xtream API
   * @param options.username - The username to authenticate with
   * @param options.password - The password to authenticate with
   * @param options.preferredFormat - Optional preferred streaming format
   * @param options.serializer - Optional custom serializers for transforming API responses
   * @throws Error if required parameters are missing
   */
  constructor({
    url,
    username,
    password,
    preferredFormat,
    serializer,
  }: Options & {
    serializer?: ReturnType<typeof defineSerializers<T>>;
  }) {
    if (!url) {
      throw new Error('The Xtream URL is required');
    }

    if (!username || !password) {
      throw new Error('The authentication credentials are required');
    }

    this.#username = username.trim();
    this.#password = password.trim();
    this.baseUrl = url.replace(/\/$/, '');
    this.#apiUrl = this.baseUrl + `/player_api.php?username=${this.#username}&password=${this.#password}&action=`;

    if (preferredFormat) this.#format = preferredFormat;

    if (serializer) {
      this.serializerType = serializer.type;
      this.#serializers = {
        ...this.#serializers,
        ...serializer.serializers,
      };
    }
  }

  /**
   * Makes a request to the Xtream API.
   *
   * This private method handles the API communication and automatically fetches
   * user profile data if needed for certain operations.
   *
   * @param action - The API action to request
   * @returns Promise resolving to the JSON response
   * @throws Error if the request fails
   * @private
   */
  async #request<R>(action: string): Promise<R> {
    // For certain actions that require knowledge of allowed output formats,
    // we need to ensure the user profile is fetched first if not already cached
    if (
      ['get_live_streams', 'get_vod_streams', 'get_vod_info', 'get_series_info'].includes(action.split('&')[0]) &&
      this.userProfile === undefined
    ) {
      this.userProfile = (await this.#request<XtreamProfile>('get_profile')).user_info;
    }

    const response = await fetch(`${this.#apiUrl}${action}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return await response.json();
  }

  /**
   * Generates a stream URL for various content types (live channels, movies, TV show episodes).
   *
   * This method constructs the appropriate URL based on content type, format, and optional
   * timeshift parameters. It ensures the requested format is allowed for the user.
   *
   * @param stream - The stream request parameters
   * @returns The complete streaming URL or undefined if an invalid type is provided
   */
  generateStreamUrl(stream: StreamURLRequest): string | undefined {
    if (stream.type === 'channel') {
      let format = this.#format;

      if (format === 'rtmp') {
        return `${this.baseUrl}/live/${this.#username}/${this.#password}/${stream.streamId}.ts`;
      }

      if (stream.timeshift) {
        const { start, duration } = stream.timeshift;
        const startDate = start.toISOString().replace(/:/g, '-').replace('T', ':').slice(0, -8);
        return `${this.baseUrl}/timeshift/${this.#username}/${this.#password}/${duration}/${startDate}/${
          stream.streamId
        }.ts`;
      }

      // Check if requested format is allowed for the user
      // If not, fall back to first allowed format for the user
      // Otherwise, if no allowed formats are specified, fall back to requested format
      // Some services may return empty objects for userProfile
      if (
        !this.userProfile?.allowed_output_formats.includes(stream.extension)
      ) {
        format =
          this.userProfile?.allowed_output_formats[0] ?? stream.extension;
      }
      return `${this.baseUrl}/live/${this.#username}/${this.#password}/${stream.streamId}.${format}`;
    }

    if (stream.type === 'episode') {
      return `${this.baseUrl}/series/${this.#username}/${this.#password}/${stream.streamId}.${stream.extension}`;
    }

    if (stream.type === 'movie') {
      return `${this.baseUrl}/movie/${this.#username}/${this.#password}/${stream.streamId}.${stream.extension}`;
    }

    return undefined;
  }

  /**
   * Gets the profile information of the authenticated user.
   *
   * This includes subscription details, allowed output formats, and other user-specific settings.
   *
   * @returns The user profile information, optionally transformed by custom serializer
   */
  async getProfile(): Promise<T extends { profile: (input: XtreamUserProfile) => infer R } ? R : XtreamUserProfile> {
    const profile = await this.#request<XtreamProfile>('get_profile');
    return this.#serializers.profile(profile.user_info);
  }

  /**
   * Gets information about the Xtream server.
   *
   * This includes details about the server's time, timezone, and version.
   *
   * @returns Server information, optionally transformed by custom serializer
   */
  async getServerInfo(): Promise<
    T extends { serverInfo: (input: XtreamServerInfo) => infer R } ? R : XtreamServerInfo
  > {
    const profile = await this.#request<XtreamProfile>('get_server_info');
    return this.#serializers.serverInfo(profile.server_info);
  }

  /**
   * Gets the list of all available live channel categories.
   *
   * Categories are used to organize content into groups like Sports, News, Entertainment, etc.
   *
   * @returns A list of channel categories, optionally transformed by custom serializer
   */
  async getChannelCategories(): Promise<
    T extends {
      channelCategories: (input: XtreamCategory[]) => infer R;
    }
      ? R
      : XtreamCategory[]
  > {
    const categories = await this.#request<XtreamCategory[]>('get_live_categories');
    return this.#serializers.channelCategories(categories);
  }

  /**
   * Gets the list of all available movie categories.
   *
   * Categories are used to organize content into groups like Action, Comedy, Drama, etc.
   *
   * @returns A list of movie categories, optionally transformed by custom serializer
   */
  async getMovieCategories(): Promise<
    T extends { movieCategories: (input: XtreamCategory[]) => infer R } ? R : XtreamCategory[]
  > {
    const categories = await this.#request<XtreamCategory[]>('get_vod_categories');
    return this.#serializers.movieCategories(categories);
  }

  /**
   * Gets the list of all available TV show categories.
   *
   * Categories are used to organize content into groups like Drama, Comedy, Documentary, etc.
   *
   * @returns A list of TV show categories, optionally transformed by custom serializer
   */
  async getShowCategories(): Promise<
    T extends {
      showCategories: (input: XtreamCategory[]) => infer R;
    }
      ? R
      : XtreamCategory[]
  > {
    const categories = await this.#request<XtreamCategory[]>('get_series_categories');
    return this.#serializers.showCategories(categories);
  }

  /**
   * Gets the list of available live channels, with optional filtering and pagination.
   *
   * This method also automatically generates streaming URLs for each channel
   * and adds them to the channel objects.
   *
   * @param options - Filter and pagination options
   * @param options.categoryId - Optional category ID to filter channels by
   * @param options.page - Optional page number for paginated results
   * @param options.limit - Optional number of items per page
   * @returns A list of channels, optionally transformed by custom serializer
   */
  async getChannels({ categoryId, page, limit }: FilterableRequest = {}): Promise<
    T extends { channels: (input: XtreamChannel[]) => infer R } ? R : XtreamChannel[]
  > {
    const action = 'get_live_streams' + (categoryId ? `&category_id=${categoryId}` : '');
    let channels = await this.#request<XtreamChannel[]>(action);

    if (page) {
      if (!limit) limit = 10;
      const start = (page - 1) * limit;
      const end = start + limit;

      channels = channels.slice(start, end);
    }

    channels.forEach((channel) => {
      channel.url = this.generateStreamUrl({
        type: 'channel',
        streamId: channel.stream_id,
        extension: this.#format,
      });
    });

    return this.#serializers.channels(channels);
  }

  /**
   * Gets the list of available movies, with optional filtering and pagination.
   *
   * This method also automatically generates streaming URLs for each movie
   * and adds them to the movie objects.
   *
   * @param options - Filter and pagination options
   * @param options.categoryId - Optional category ID to filter movies by
   * @param options.page - Optional page number for paginated results
   * @param options.limit - Optional number of items per page
   * @returns A list of movies, optionally transformed by custom serializer
   */
  async getMovies({ categoryId, page, limit }: FilterableRequest = {}): Promise<
    T extends { movies: (input: XtreamMoviesListing[]) => infer R } ? R : XtreamMoviesListing[]
  > {
    const action = 'get_vod_streams' + (categoryId ? `&category_id=${categoryId}` : '');
    let movies = await this.#request<XtreamMoviesListing[]>(action);

    if (page) {
      if (!limit) limit = 10;
      const start = (page - 1) * limit;
      const end = start + limit;

      movies = movies.slice(start, end);
    }

    movies.forEach((movie) => {
      movie.url = this.generateStreamUrl({
        type: 'movie',
        streamId: movie.stream_id,
        extension: movie.container_extension,
      });
    });

    return this.#serializers.movies(movies);
  }

  /**
   * Gets detailed information about a specific movie.
   *
   * This includes metadata like plot, cast, director, release date, etc.
   * Also generates and adds the streaming URL to the movie object.
   *
   * @param options - The movie request options
   * @param options.movieId - ID of the movie to retrieve
   * @returns Detailed movie information, optionally transformed by custom serializer
   * @throws Error if the movie is not found
   */
  async getMovie({
    movieId,
  }: MovieOptions): Promise<T extends { movie: (input: XtreamMovie) => infer R } ? R : XtreamMovie> {
    const movie = await this.#request<XtreamMovie>('get_vod_info&vod_id=' + movieId);

    if (Array.isArray(movie.info) && movie.info.length === 0) {
      throw new Error('Movie Not Found');
    }

    movie.url = this.generateStreamUrl({
      type: 'movie',
      streamId: movie.movie_data.stream_id,
      extension: movie.movie_data.container_extension,
    });

    return this.#serializers.movie(movie);
  }

  /**
   * Gets the list of available TV shows, with optional filtering and pagination.
   *
   * @param options - Filter and pagination options
   * @param options.categoryId - Optional category ID to filter shows by
   * @param options.page - Optional page number for paginated results
   * @param options.limit - Optional number of items per page
   * @returns A list of TV shows, optionally transformed by custom serializer
   */
  async getShows({ categoryId, page, limit }: FilterableRequest = {}): Promise<
    T extends { shows: (input: XtreamShowListing[]) => infer R } ? R : XtreamShowListing[]
  > {
    const action = 'get_series' + (categoryId ? `&category_id=${categoryId}` : '');
    let shows = await this.#request<XtreamShowListing[]>(action);

    if (page) {
      if (!limit) limit = 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      shows = shows.slice(start, end);
    }

    return this.#serializers.shows(shows);
  }

  /**
   * Gets detailed information about a specific TV show.
   *
   * This includes metadata about the show and all its episodes organized by season.
   * Also generates and adds streaming URLs for each episode.
   *
   * @param options - The show request options
   * @param options.showId - ID of the show to retrieve
   * @returns Detailed show information, optionally transformed by custom serializer
   * @throws Error if the show is not found
   */
  async getShow({ showId }: ShowOptions): Promise<T extends { show: (input: XtreamShow) => infer R } ? R : XtreamShow> {
    const show = await this.#request<XtreamShow>('get_series_info&series_id=' + showId);

    if (show.info.name === null) {
      throw new Error('Show Not Found');
    }

    show.info.series_id = Number(showId);

    Object.keys(show.episodes).forEach((season) => {
      show.episodes[season].forEach((episode) => {
        episode.url = this.generateStreamUrl({
          type: 'episode',
          streamId: episode.id,
          extension: episode.container_extension,
        });
      });
    });

    return this.#serializers.show(show);
  }

  /**
   * Gets short EPG (Electronic Program Guide) information for a specific channel.
   *
   * Short EPG typically contains programming information for a limited time period.
   *
   * @param options - The EPG request options
   * @param options.channelId - ID of the channel to retrieve EPG for
   * @param options.limit - Optional number of EPG entries to return
   * @returns Short EPG information, optionally transformed by custom serializer
   */
  async getShortEPG({
    channelId,
    limit,
  }: EPGOptions): Promise<T extends { shortEPG: (input: XtreamShortEPG) => infer R } ? R : XtreamShortEPG> {
    const action = `get_short_epg&stream_id=${channelId}` + (limit ? `&limit=${limit}` : '');
    const epg = await this.#request<XtreamShortEPG>(action);
    return this.#serializers.shortEPG(epg);
  }

  /**
   * Gets full EPG (Electronic Program Guide) information for a specific channel.
   *
   * Full EPG contains complete programming information for a longer time period.
   *
   * @param options - The EPG request options
   * @param options.channelId - ID of the channel to retrieve EPG for
   * @returns Full EPG information, optionally transformed by custom serializer
   */
  async getFullEPG({
    channelId,
  }: EPGOptions): Promise<T extends { fullEPG: (input: XtreamFullEPG) => infer R } ? R : XtreamFullEPG> {
    const action = `get_simple_data_table&stream_id=${channelId}`;
    const epg = await this.#request<XtreamFullEPG>(action);
    return this.#serializers.fullEPG(epg);
  }
}

/**
 * Helper function to define custom serializers for the Xtream client.
 *
 * This function provides type checking for serializer configurations and
 * returns a properly structured serializer object that can be passed to
 * the Xtream constructor.
 *
 * @param type - A string identifier for the serializer type (e.g., 'standardized', 'jsonapi')
 * @param serializers - An object containing custom serializer functions
 * @returns A configured serializer object ready to use with the Xtream class
 */
export function defineSerializers<T extends Partial<Serializers>>(
  type: string,
  serializers: T & Record<Exclude<keyof T, keyof Serializers>, never>,
): { type: string; serializers: T } {
  return { type, serializers };
}
