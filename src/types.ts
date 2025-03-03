/**
 * These types represent the data as retrieved from the Xtream API
 * Not every version of the Xtream API will return all of these fields
 */

/**
 * Xtream category information
 *
 * This type represents a content category in the Xtream system
 */
export type XtreamCategory = {
  /** The unique identifier for the category */
  category_id: string;
  /** The display name of the category */
  category_name: string;
  /** The ID of the parent category, if applicable */
  parent_id: string;
};

/**
 * Xtream movie information
 *
 * This type represents a movie in the Xtream system
 */
export type XtreamMovies = {
  /** The position/order number of the movie */
  num: number;
  /** The title of the movie */
  name: string;
  /** The type of stream (e.g., "movie") */
  stream_type: string;
  /** The unique identifier for the stream */
  stream_id: number;
  /** The URL for the movie's icon/poster */
  stream_icon: string;
  /** The movie's rating as a string */
  rating: number;
  /** The movie's rating on a 5-point scale */
  rating_5based: number;
  /** The movie's ID in The Movie Database (TMDB) */
  tmdb?: number;
  /** The URL to the movie's trailer */
  trailer: string;
  /** The genres of the movie */
  genre: string;
  /** The date when the movie was added to the system */
  added: string;
  /** Flag indicating if the content is for adults (0/1) */
  is_adult: number;
  /** The runtime of the movie in minutes */
  episode_run_time: number;
  /** The primary category ID of the movie */
  category_id: string;
  /** All category IDs the movie belongs to */
  category_ids: number[];
  /** The file format extension */
  container_extension: string;
  /** Custom stream identifier */
  custom_sid: any;
  /** The direct URL to the movie's source */
  direct_source: string;
  /** The release date of the movie */
  release_date: string;
  /** The cast of the movie */
  cast: string;
  /** The director(s) of the movie */
  director: string;
  /** The synopsis/description of the movie */
  plot: string;
  /** The URL to access the movie */
  url: string;
};

/**
 * Xtream channel information
 *
 * This type represents a live TV channel in the Xtream system
 */
export type XtreamChannel = {
  /** The position/order number of the channel */
  num: number;
  /** The name of the channel */
  name: string;
  /** The type of stream (e.g., "live") */
  stream_type: string;
  /** The unique identifier for the stream */
  stream_id: number;
  /** The URL for the channel's logo */
  stream_icon: string;
  /** The URL for the channel's cover image */
  thumbnail: string;
  /** The Electronic Program Guide channel ID */
  epg_channel_id: string;
  /** The date when the channel was added to the system */
  added: string;
  /** Flag indicating if the content is for adults (0/1) */
  is_adult: number;
  /** The primary category ID of the channel */
  category_id: string;
  /** All category IDs the channel belongs to */
  category_ids: number[];
  /** Custom stream identifier */
  custom_sid: string;
  /** Flag indicating if TV archive is available (0/1) */
  tv_archive: number;
  /** The direct URL to the channel's source */
  direct_source: string;
  /** The duration of available archive in days */
  tv_archive_duration: number;
  /** The URL to access the channel */
  url: string;
};

/**
 * Xtream profile information
 *
 * This type represents the complete profile information including user details and server information
 */
export type XtreamProfile = {
  /** Information about the user's account */
  user_info: XtreamUserProfile;
  /** Information about the Xtream server */
  server_info: XtreamServerInfo;
};

/**
 * Xtream user profile information
 *
 * This type represents the user-specific part of the profile
 */
export type XtreamUserProfile = {
  /** The username of the account */
  username: string;
  /** The password of the account */
  password: string;
  /** Any message from the server about the account */
  message: string;
  /** Authentication status (1 for authenticated) */
  auth: number;
  /** Account status (e.g., "Active") */
  status: string;
  /** The expiration date of the account */
  exp_date: string;
  /** Flag indicating if the account is a trial */
  is_trial: string;
  /** Number of active connections currently used */
  active_cons: string;
  /** The date when the account was created */
  created_at: string;
  /** Maximum allowed concurrent connections */
  max_connections: string;
  /** Formats the user is allowed to access */
  allowed_output_formats: string[];
};

/**
 * Xtream server information
 *
 * This type represents the server-specific part of the profile
 */
export type XtreamServerInfo = {
  /** The base URL of the Xtream server */
  url: string;
  /** The HTTP port number */
  port: string;
  /** The HTTPS port number */
  https_port: string;
  /** The protocol used by the server */
  server_protocol: string;
  /** The RTMP port number for streaming */
  rtmp_port: string;
  /** The timezone setting of the server */
  timezone: string;
  /** The current server timestamp */
  timestamp_now: number;
  /** The current server time as a formatted string */
  time_now: string;
  /** Server process status */
  process: boolean;
};

/**
 * Xtream TV show information
 *
 * This type represents a TV show in the Xtream system
 */
export type XtreamTVShow = {
  /** The position/order number of the TV show */
  num: number;
  /** The title of the TV show */
  name: string;
  /** The unique identifier for the series */
  series_id: number;
  /** The type of stream (e.g., "series") */
  stream_type: string;
  /** The URL for the TV show's cover image */
  cover: string;
  /** The synopsis/description of the TV show */
  plot: string;
  /** The cast members of the TV show */
  cast: string;
  /** The director(s) of the TV show */
  director: string;
  /** The genre(s) of the TV show */
  genre: string;
  /** The release date of the TV show (alternate format) */
  releasedate: string;
  /** The release date of the TV show */
  release_date: string;
  /** The date when the TV show was last updated */
  last_modified: string;
  /** The TV show's rating as a string */
  rating: string;
  /** The TV show's rating on a 5-point scale as a string */
  rating_5based: string;
  /** Array of backdrop image URLs */
  backdrop_path: string[];
  /** The YouTube ID or URL for the trailer */
  youtube_trailer: string;
  /** The TV show's ID in The Movie Database (TMDB) as a string */
  tmdb: string;
  /** The average runtime of episodes as a string */
  episode_run_time: string;
  /** The primary category ID of the TV show */
  category_id: string;
  /** All category IDs the TV show belongs to */
  category_ids: number[];
  /** The URL to access the TV show */
  url: string;
};

/**
 * Xtream TV show detailed information
 *
 * This type represents the complete information about a TV show including seasons and episodes
 */
export type XtreamTVShowInfo = {
  /** Array of seasons in the TV show */
  seasons: XtreamSeason[];
  /** Basic information about the TV show */
  info: XtreamTVShow;
  /** Object containing episodes grouped by season number */
  episodes: {
    [key: string]: XtreamEpisode[];
  };
};

/**
 * Xtream season information
 *
 * This type represents a season of a TV show in the Xtream system
 */
export type XtreamSeason = {
  /** The unique identifier for the season */
  id: number;
  /** The name of the season */
  name: string;
  /** The number of episodes in the season as a string */
  episode_count: string;
  /** The synopsis/description of the season */
  overview: string;
  /** The date when the season first aired */
  air_date: string;
  /** The URL for the season's cover image */
  cover: string;
  /** The TMDB URL for the season's cover image */
  cover_tmdb: string;
  /** The season number */
  season_number: number;
  /** The URL for a larger version of the season's cover */
  cover_big: string;
  /** The release date of the season */
  releaseDate: string;
  /** The average duration of episodes in the season */
  duration?: string;
};

/**
 * Xtream episode information
 *
 * This type represents an episode in a TV show in the Xtream system
 */
export type XtreamEpisode = {
  /** The unique identifier for the episode */
  id: string;
  /** The episode number within the season */
  episode_num: number;
  /** The title of the episode */
  title: string;
  /** The synopsis/description of the episode */
  plot: string;
  /** The file format extension */
  container_extension: string;
  /** Detailed information about the episode */
  info: XtreamEpisodeInfo;
  /** Custom stream identifier */
  custom_sid: string;
  /** The date when the episode was added to the system */
  added: string;
  /** The season number the episode belongs to */
  season: number;
  /** The direct URL to the episode's source */
  direct_source: string;
  /** The URL to access the episode */
  url: string;
};

/**
 * Xtream video information
 *
 * This type represents the technical details of a video stream
 */
export type XtreamVideoInfo = {
  /** The stream index in the container */
  index: number;
  /** The short name of the codec */
  codec_name: string;
  /** The full name of the codec */
  codec_long_name: string;
  /** The codec profile */
  profile: string;
  /** The type of the codec (e.g., "video") */
  codec_type: string;
  /** The codec tag as a string */
  codec_tag_string: string;
  /** The codec tag */
  codec_tag: string;
  /** The width of the video in pixels */
  width: number;
  /** The height of the video in pixels */
  height: number;
  /** The coded width of the video */
  coded_width: number;
  /** The coded height of the video */
  coded_height: number;
  /** Flag indicating if closed captions are available */
  closed_captions: number;
  /** Flag indicating if film grain is present */
  film_grain: number;
  /** Flag indicating if B-frames are used */
  has_b_frames: number;
  /** The sample aspect ratio */
  sample_aspect_ratio: string;
  /** The display aspect ratio */
  display_aspect_ratio: string;
  /** The pixel format */
  pix_fmt: string;
  /** The codec level */
  level: number;
  /** The color range */
  color_range: string;
  /** The color space */
  color_space: string;
  /** The color transfer characteristics */
  color_transfer: string;
  /** The color primaries */
  color_primaries: string;
  /** The chroma sample location */
  chroma_location: string;
  /** The field order */
  field_order: string;
  /** The number of reference frames */
  refs: number;
  /** Flag indicating if AVC format is used */
  is_avc: string;
  /** The NAL unit length size */
  nal_length_size: string;
  /** The real frame rate */
  r_frame_rate: string;
  /** The average frame rate */
  avg_frame_rate: string;
  /** The time base */
  time_base: string;
  /** The starting presentation timestamp */
  start_pts: number;
  /** The starting time */
  start_time: string;
  /** The bits per raw sample */
  bits_per_raw_sample: string;
  /** The size of extra data */
  extradata_size: number;
  /** The stream disposition flags */
  disposition: {
    /** Default flag */
    default: number;
    /** Dub flag */
    dub: number;
    /** Original flag */
    original: number;
    /** Comment flag */
    comment: number;
    /** Lyrics flag */
    lyrics: number;
    /** Karaoke flag */
    karaoke: number;
    /** Forced flag */
    forced: number;
    /** Hearing impaired flag */
    hearing_impaired: number;
    /** Visual impaired flag */
    visual_impaired: number;
    /** Clean effects flag */
    clean_effects: number;
    /** Attached picture flag */
    attached_pic: number;
    /** Timed thumbnails flag */
    timed_thumbnails: number;
    /** Captions flag */
    captions: number;
    /** Descriptions flag */
    descriptions: number;
    /** Metadata flag */
    metadata: number;
    /** Dependent flag */
    dependent: number;
    /** Still image flag */
    still_image: number;
  };
  /** The metadata tags */
  tags: {
    [key: string]: string;
  };
};

/**
 * Xtream audio information
 *
 * This type represents the technical details of an audio stream
 */
export type XtreamAudioInfo = {
  /** The stream index in the container */
  index: number;
  /** The short name of the codec */
  codec_name: string;
  /** The full name of the codec */
  codec_long_name: string;
  /** The type of the codec (e.g., "audio") */
  codec_type: string;
  /** The codec tag as a string */
  codec_tag_string: string;
  /** The codec tag */
  codec_tag: string;
  /** The sample format */
  sample_fmt: string;
  /** The sample rate in Hz */
  sample_rate: string;
  /** The number of audio channels */
  channels: number;
  /** The channel layout (e.g., "stereo") */
  channel_layout: string;
  /** The bits per sample */
  bits_per_sample: number;
  /** The real frame rate */
  r_frame_rate: string;
  /** The average frame rate */
  avg_frame_rate: string;
  /** The time base */
  time_base: string;
  /** The starting presentation timestamp */
  start_pts: number;
  /** The starting time */
  start_time: string;
  /** The bitrate in bits per second */
  bit_rate: string;
  /** The stream disposition flags */
  disposition: {
    /** Default flag */
    default: number;
    /** Dub flag */
    dub: number;
    /** Original flag */
    original: number;
    /** Comment flag */
    comment: number;
    /** Lyrics flag */
    lyrics: number;
    /** Karaoke flag */
    karaoke: number;
    /** Forced flag */
    forced: number;
    /** Hearing impaired flag */
    hearing_impaired: 0;
    /** Visual impaired flag */
    visual_impaired: 0;
    /** Clean effects flag */
    clean_effects: 0;
    /** Attached picture flag */
    attached_pic: 0;
    /** Timed thumbnails flag */
    timed_thumbnails: 0;
    /** Captions flag */
    captions: 0;
    /** Descriptions flag */
    descriptions: 0;
    /** Metadata flag */
    metadata: 0;
    /** Dependent flag */
    dependent: 0;
    /** Still image flag */
    still_image: 0;
  };
  /** The metadata tags */
  tags: {
    [key: string]: string;
  };
};

/**
 * Xtream episode information
 *
 * This type represents the information about an episode in a TV show
 */
export type XtreamEpisodeInfo = {
  /** The air date of the episode */
  air_date?: string;
  /** The release date of the episode */
  release_date: string;
  /** The crew of the episode */
  crew: string;
  /** The rating of the episode */
  rating: string;
  /** The image of the episode */
  movie_image: string;
  /** The big cover of the episode */
  cover_big: string;
  /** The duration of the episode in seconds */
  duration_secs: number;
  /** The formatted duration of the episode */
  duration: string;
  /** The id of the episode in The Movie Database */
  tmdbId: number;
  /** The video information of the episode */
  video?: XtreamVideoInfo;
  /** The audio information of the episode */
  audio?: XtreamAudioInfo;
  /** The bitrate of the episode */
  bitrate: number;
};

/**
 * Xtream short EPG information
 *
 * This type represents the short EPG information for a channel
 */
export type XtreamShortEPG = {
  /** The list of EPG listings */
  epg_listings: XtreamEPGListing[];
};

/**
 * Xtream EPG listing information
 *
 * This type represents a single EPG listing for a channel
 */
export type XtreamEPGListing = {
  /** The unique identifier for the listing */
  id: string;
  /** The EPG ID of the listing */
  epg_id: string;
  /** The title of the listing */
  title: string;
  /** The language of the listing */
  lang: string;
  /** The start time of the listing */
  start: string;
  /** The end time of the listing */
  end: string;
  /** The description of the listing */
  description: string;
  /** The channel ID of the listing */
  channel_id: string;
  /** The start timestamp of the listing */
  start_timestamp: string;
  /** The stop timestamp of the listing */
  stop_timestamp: string;
  /** The stop time of the listing */
  stop: string;
};

/**
 * Xtream EPG information
 *
 * This type represents the full EPG information for a channel
 */
export type XtreamFullEPG = {
  /** The list of EPG listings */
  epg_listings: XtreamFullEPGListing[];
};

/**
 * Xtream full EPG listing information
 *
 * This type represents a single EPG listing for a channel with additional information
 */
export type XtreamFullEPGListing = Prettify<
  Omit<XtreamEPGListing, 'stop'> & {
    /** Flag indicating if the listing is currently playing */
    now_playing: number;
    /** Flag indicating if the listing has an archive available */
    has_archive: number;
  }
>;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
