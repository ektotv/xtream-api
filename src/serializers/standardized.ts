import camelCaseKeys from 'camelcase-keys';
import { defineSerializers } from '../xtream.ts';
import type { XtreamCategory, Prettify } from '../types.ts';

/**
 * Standardized serializers for the Xtream API
 *
 * This serializer will transform the API response into a standardized format
 * ensuring dates are dates, keys are camel case, keys are consistent, etc.
 */
export const standardizedSerializer = defineSerializers('Standardized', {
  profile: (input): StandardXtreamProfile => {
    const { auth, expDate, maxConnections, activeCons, createdAt, ...camelInput } = camelCaseKeys(input);

    return {
      id: camelInput.username,
      ...camelInput,
      isTrial: camelInput.isTrial === '1',
      maxConnections: Number(maxConnections),
      activeConnections: Number(activeCons),
      createdAt: new Date(Number(createdAt) * 1000),
      expiresAt: new Date(Number(expDate) * 1000),
    };
  },

  serverInfo: (input): StandardXtreamServerInfo => {
    const { timestampNow, ...camelInput } = camelCaseKeys(input);

    return {
      id: input.url,
      ...camelInput,
      timeNow: new Date(Number(timestampNow) * 1000),
    };
  },

  channelCategories: (input): StandardXtreamCategory[] => {
    return categoryMapper(input);
  },

  movieCategories: (input): StandardXtreamCategory[] => {
    return categoryMapper(input);
  },

  showCategories: (input): StandardXtreamCategory[] => {
    return categoryMapper(input);
  },

  channels: (input): StandardXtreamChannel[] => {
    const camelInput = camelCaseKeys(input);

    return camelInput.map((channel) => {
      const {
        added,
        num,
        streamId,
        streamType,
        categoryId,
        categoryIds,
        streamIcon,
        epgChannelId,
        tvArchive,
        ...cced
      } = channel;

      return {
        id: streamId.toString(),
        number: num,
        ...cced,
        tvArchive: tvArchive === 1,
        logo: streamIcon,
        epgId: epgChannelId,
        createdAt: new Date(Number(added) * 1000),
        categoryIds: categoryIds.map((id) => id.toString()),
      };
    });
  },

  movies: (input): StandardXtreamMovieListing[] => {
    const camelInput = camelCaseKeys(input);

    return camelInput.map((movie) => {
      const {
        num,
        streamType,
        streamIcon,
        streamId,
        releaseDate,
        rating,
        rating5Based,
        added,
        categoryIds,
        categoryId,
        episodeRunTime,
        genre,
        cast,
        director,
        youtubeTrailer,
        ...cced
      } = movie;

      return {
        id: streamId.toString(),
        ...cced,
        genre: genre.split(',').map((x) => x.trim()),
        cast: cast.split(',').map((x) => x.trim()),
        director: director.split(',').map((x) => x.trim()),
        poster: streamIcon,
        duration: Number(episodeRunTime) * 60,
        voteAverage: Number(rating),
        releaseDate: new Date(releaseDate),
        youtubeId: youtubeTrailer,
        createdAt: new Date(Number(added) * 1000),
        categoryIds: categoryIds.map((id) => id.toString()),
      };
    });
  },

  movie: (input): StandardXtreamMovie => {
    const camelInput = camelCaseKeys(input, { deep: true });

    const {
      director,
      actors,
      genre,
      cast,
      oName,
      releaseDate,
      releasedate,
      mpaaRating,
      age,
      rating,
      duration,
      durationSecs,
      coverBig,
      movieImage,
      backdropPath,
      ratingCountKinopoisk,
      episodeRunTime,
      youtubeTrailer,
      tmdbId,
      ...restInfo
    } = camelInput.info;
    const { categoryId, categoryIds, streamId, added, ...restData } = camelInput.movieData;

    return {
      id: streamId.toString(),
      informationUrl: restInfo.kinopoiskUrl,
      originalName: oName,
      cover: coverBig,
      poster: movieImage,
      duration: durationSecs,
      durationFormatted: duration,
      voteAverage: rating,
      director: director.split(',').map((x) => x.trim()),
      actors: actors.split(',').map((x) => x.trim()),
      cast: cast.split(',').map((x) => x.trim()),
      genre: genre.split(',').map((x) => x.trim()),
      categoryIds: categoryIds.map((id) => id.toString()),
      tmdbId: tmdbId.toString(),
      youtubeId: youtubeTrailer,
      releaseDate: new Date(releaseDate),
      createdAt: new Date(Number(added) * 1000),
      rating: {
        mpaa: mpaaRating,
        age: Number(age),
      },
      ...restData,
      ...restInfo,
    };
  },

  shows: (input): Prettify<Omit<StandardXtreamShow, 'seasons'>>[] => {
    const camelInput = camelCaseKeys(input);

    return camelInput.map((show) => {
      const {
        num,
        streamType,
        rating,
        rating5Based,
        seriesId,
        cover,
        categoryId,
        categoryIds,
        backdropPath,
        releaseDate,
        episodeRunTime,
        lastModified,
        cast,
        director,
        genre,
        youtubeTrailer,
        ...restShow
      } = show;

      return {
        id: seriesId.toString(),
        ...restShow,
        cast: cast.split(',').map((x) => x.trim()),
        director: director.split(',').map((x) => x.trim()),
        genre: genre.split(',').map((x) => x.trim()),
        voteAverage: Number(rating),
        poster: cover,
        cover: backdropPath[0],
        duration: Number(episodeRunTime) * 60,
        releaseDate: new Date(releaseDate),
        updatedAt: new Date(Number(lastModified) * 1000),
        categoryIds: categoryIds.map((id) => id.toString()),
        youtubeId: youtubeTrailer,
      };
    });
  },

  show: (input): StandardXtreamShow => {
    const { seasons, info, episodes } = camelCaseKeys(input, {
      deep: true,
    });

    const {
      rating,
      rating5Based,
      seriesId,
      cover,
      categoryId,
      categoryIds,
      backdropPath,
      releaseDate,
      episodeRunTime,
      lastModified,
      cast,
      director,
      genre,
      youtubeTrailer,
      ...restShowInfo
    } = info;

    const flatEpisodes = Object.values(episodes).flat();

    const mappedEpisodes: StandardXtreamEpisode[] = flatEpisodes.map((episode) => {
      const { id, season, episodeNum, added, info, ...restEpisode } = episode;

      const { releaseDate, movieImage, coverBig, durationSecs, duration, tmdbId, ...restEpisodeInfo } = info;
      const seasonId = seasons.find((x) => x.seasonNumber === season)?.id.toString() || season.toString();

      return {
        id,
        number: Number(episodeNum),
        ...restEpisode,
        ...restEpisodeInfo,
        tmdbId: tmdbId?.toString(),
        poster: movieImage,
        cover: coverBig,
        duration: durationSecs,
        durationFormatted: duration,
        releaseDate: new Date(releaseDate),
        createdAt: new Date(Number(added) * 1000),
        showId: seriesId.toString(),
        seasonId: seasonId,
      };
    });

    let seasonsToMap = seasons;

    if (seasonsToMap.length === 0) {
      // if xtream provides no seasons, we will use the episode keys to generate seasons
      seasonsToMap = Object.keys(episodes).map((season) => {
        const seasonNumber = season;
        const firstEpisode = episodes[season][0];
        return {
          id: Number(seasonNumber),
          name: `Season ${seasonNumber}`,
          episodeCount: episodes[season].length,
          overview: '',
          airDate: firstEpisode.info.releaseDate,
          cover: firstEpisode.info.movieImage,
          seasonNumber: Number(seasonNumber),
          voteAverage: Number(firstEpisode.info.rating),
          coverBig: firstEpisode.info.movieImage,
          releaseDate: firstEpisode.info.releaseDate,
        };
      });
    }

    const mappedSeasons: StandardXtreamSeason[] = seasonsToMap.map((season) => {
      const { id, seasonNumber, cover, coverBig, airDate, ...restSeason } = season;

      return {
        id: id.toString(),
        ...restSeason,
        releaseDate: new Date(airDate),
        number: seasonNumber,
        cover: coverBig,
        showId: seriesId.toString(),
        episodes: mappedEpisodes.filter((episode) => episode.seasonId === id.toString()),
      };
    });

    return {
      id: info.seriesId.toString(),
      ...restShowInfo,
      voteAverage: Number(rating),
      poster: cover,
      cover: backdropPath[0],
      duration: Number(episodeRunTime) * 60,
      cast: cast.split(',').map((x) => x.trim()),
      director: director.split(',').map((x) => x.trim()),
      genre: genre.split(',').map((x) => x.trim()),
      youtubeId: youtubeTrailer,
      releaseDate: new Date(releaseDate),
      updatedAt: new Date(Number(lastModified) * 1000),
      categoryIds: categoryIds.map((id) => id.toString()),
      seasons: mappedSeasons,
    };
  },

  shortEPG: (input): StandardXtreamShortEPGListing[] => {
    const { epgListings } = camelCaseKeys(input, { deep: true });

    return epgListings.map((listing) => {
      const { lang, startTimestamp, stopTimestamp, stop, start, end, title, description, ...restListing } = listing;

      return {
        ...restListing,
        start: new Date(start),
        end: new Date(Number(end) * 1000),
        title: atob(title),
        description: atob(description),
        language: lang,
      };
    });
  },

  fullEPG: (input): StandardXtreamFullEPGListing[] => {
    const { epgListings } = camelCaseKeys(input, { deep: true });

    return epgListings.map((listing) => {
      const {
        lang,
        startTimestamp,
        stopTimestamp,
        start,
        end,
        title,
        description,
        nowPlaying,
        hasArchive,
        ...restListing
      } = listing;

      return {
        ...restListing,
        start: new Date(start),
        end: new Date(end),
        title: atob(title),
        description: atob(description),
        language: lang,
        nowPlaying: Boolean(nowPlaying),
        hasArchive: Boolean(hasArchive),
      };
    });
  },
});

function categoryMapper(input: XtreamCategory[]): StandardXtreamCategory[] {
  const camelInput = camelCaseKeys(input);

  return camelInput.map((category) => {
    const { categoryId, categoryName, parentId } = category;

    return {
      id: categoryId.toString(),
      name: categoryName,
      parentId: parentId.toString(),
    };
  });
}

/**
 * Standardized Xtream profile information
 *
 * This type represents the complete user profile information in a standardized format
 */
export type StandardXtreamProfile = {
  /** The unique identifier for the profile (username) */
  id: string;
  /** The username of the account */
  username: string;
  /** The password of the account */
  password: string;
  /** Account status (e.g., "Active") */
  status: string;
  /** Number of active connections currently used */
  activeConnections: number;
  /** Maximum allowed concurrent connections */
  maxConnections: number;
  /** Flag indicating if the account is a trial */
  isTrial: boolean;
  /** The date when the account was created */
  createdAt: Date;
  /** The expiration date of the account */
  expiresAt: Date;
};

/**
 * Standardized Xtream server information
 *
 * This type represents the server-specific information in a standardized format
 */
export type StandardXtreamServerInfo = {
  /** The unique identifier for the server (URL) */
  id: string;
  /** The base URL of the Xtream server */
  url: string;
  /** The HTTP port number */
  port: string;
  /** The HTTPS port number */
  httpsPort: string;
  /** The protocol used by the server */
  serverProtocol: string;
  /** The RTMP port number for streaming */
  rtmpPort: string;
  /** The timezone setting of the server */
  timezone: string;
  /** The current server time as a Date object */
  timeNow: Date;
};

/**
 * Standardized Xtream category information
 *
 * This type represents a content category in the Xtream system in a standardized format
 */
export type StandardXtreamCategory = {
  /** The unique identifier for the category */
  id: string;
  /** The display name of the category */
  name: string;
  /** The ID of the parent category, if applicable */
  parentId: string;
};

/**
 * Standardized Xtream channel information
 *
 * This type represents a live TV channel in the Xtream system in a standardized format
 */
export type StandardXtreamChannel = {
  /** The unique identifier for the channel */
  id: string;
  /** The name of the channel */
  name: string;
  /** The Electronic Program Guide channel ID */
  epgId: string;
  /** The position/order number of the channel */
  number: number;
  /** Custom stream identifier */
  customSid: string;
  /** Flag indicating if TV archive is available */
  tvArchive: boolean;
  /** The direct URL to the channel's source */
  directSource: string;
  /** The duration of available archive in days */
  tvArchiveDuration: number;
  /** The URL for the channel's cover image */
  thumbnail: string;
  /** The URL for the channel's logo */
  logo: string;
  /** The date when the channel was added to the system */
  createdAt: Date;
  /** All category IDs the channel belongs to */
  categoryIds?: string[];
};

/**
 * Standardized Xtream movie listing
 *
 * This type represents a movie in the Xtream system in a standardized format
 */
export type StandardXtreamMovieListing = {
  /** The unique identifier for the movie */
  id: string;
  /** The title of the movie */
  name: string;
  /** The synopsis/description of the movie */
  plot: string;
  /** The movie's rating */
  voteAverage: number;
  /** The URL for the movie's poster */
  poster: string;
  /** The release date of the movie */
  releaseDate: Date;
  /** The runtime of the movie in seconds */
  duration: number;
  /** The cast of the movie as an array */
  cast: string[];
  /** The director(s) of the movie as an array */
  director: string[];
  /** The genres of the movie as an array */
  genre: string[];
  /** The date when the movie was added to the system */
  createdAt: Date;
  /** All category IDs the movie belongs to */
  categoryIds?: string[];
};

/**
 * Standardized Xtream TV movie information
 */
export type StandardXtreamMovie = {
  /** The unique identifier for the stream */
  id: string;
  /** The URL to the movie's Kinopoisk page */
  informationUrl: string;
  /** The ID of the movie in The Movie Database (TMDB) */
  tmdbId: string;
  /** The title of the movie */
  name: string;
  /** The original title of the movie */
  originalName: string;
  /** The URL for the movie's cover image */
  cover: string;
  /** The URL for the movie's image */
  poster: string;
  /** The release date of the movie */
  releaseDate: Date;
  /** The YouTube ID or URL for the trailer */
  youtubeId: string;
  /** The director(s) of the movie */
  director: string[];
  /** The actors in the movie */
  actors: string[];
  /** The cast of the movie */
  cast: string[];
  /** The synopsis/description of the movie */
  description: string;
  /** The plot of the movie */
  plot: string;
  /** The age abd MPAA rating of the movie */
  rating: {
    age: number;
    mpaa: string;
  };
  /** The country of origin for the movie */
  country: string;
  /** The genre(s) of the movie */
  genre: string[];
  /** The duration of the movie in seconds */
  duration: number;
  /** The formatted duration of the movie */
  durationFormatted: string;
  /** The bitrate of the movie */
  bitrate: number;
  /** Array of available subtitles */
  subtitles: string[];
  /** The rating of the movie */
  voteAverage: number;
  /** The date when the movie was added to the system */
  createdAt: Date;
  /** All category IDs the movie belongs to */
  categoryIds: string[];
  /** The file format extension */
  containerExtension: string;
  /** Custom stream identifier */
  customSid: string;
  /** The direct URL to the movie's source */
  directSource: string;
};

/**
 * Standardized Xtream show information
 *
 * This type represents a show in the Xtream system in a standardized format
 */
export type StandardXtreamShow = {
  /** The unique identifier for the show */
  id: string;
  /** The title of the show */
  name: string;
  /** The synopsis/description of the show */
  plot: string;
  /** The show's rating */
  voteAverage: number;
  /** The URL for the show's poster image */
  poster: string;
  /** The URL for the show's cover image */
  cover: string;
  /** The release date of the show */
  releaseDate: Date;
  /** The average runtime of episodes in seconds */
  duration: number;
  /** Youtube ID of trailer */
  youtubeId: string;
  /** The cast members of the show as an array */
  cast: string[];
  /** The director(s) of the show as an array */
  director: string[];
  /** The genre(s) of the show as an array */
  genre: string[];
  /** The date when the show was last updated */
  updatedAt: Date;
  /** All category IDs the show belongs to */
  categoryIds?: string[];
  /** Array of seasons in the show */
  seasons: StandardXtreamSeason[];
};

/**
 * Standardized Xtream episode information
 *
 * This type represents an episode in a show in the Xtream system in a standardized format
 */
export type StandardXtreamEpisode = {
  /** The unique identifier for the episode */
  id: string;
  /** The episode number within the season */
  number: number;
  /** The title of the episode */
  title: string;
  /** The synopsis/description of the episode */
  plot: string;
  /** The release date of the episode */
  releaseDate: Date;
  /** The duration of the episode in seconds */
  duration: number;
  /** The formatted duration of the episode */
  durationFormatted: string;
  /** The URL for the episode's poster image */
  poster: string;
  /** The URL for the episode's cover image */
  cover: string;
  /** The id of the episode in The Movie Database */
  tmdbId: string;
  /** The date when the episode was added to the system */
  createdAt: Date;
  /** The ID of the season this episode belongs to */
  seasonId?: string;
  /** The ID of the show this episode belongs to */
  showId: string;
};

/**
 * Standardized Xtream season information
 *
 * This type represents a season of a show in the Xtream system in a standardized format
 */
export type StandardXtreamSeason = {
  /** The unique identifier for the season */
  id: string;
  /** The season number */
  number: number;
  /** The URL for the season's cover image */
  cover: string;
  /** The date when the season first aired */
  releaseDate: Date;
  /** The ID of the show this season belongs to */
  showId: string;
  /** Episodes in this season */
  episodes?: StandardXtreamEpisode[];
};

/**
 * Standardized Xtream short EPG listing information
 *
 * This type represents a short EPG listing for a channel in a standardized format
 */
export type StandardXtreamShortEPGListing = {
  /** The unique identifier for the listing */
  id: string;
  /** The EPG ID of the listing */
  epgId: string;
  /** The title of the listing */
  title: string;
  /** The language of the listing */
  language: string;
  /** The start time of the listing */
  start: Date;
  /** The end time of the listing */
  end: Date;
  /** The description of the listing */
  description: string;
  /** The channel ID of the listing */
  channelId: string;
};

/**
 * Standardized Xtream full EPG listing information
 *
 * This type represents a full EPG listing for a channel in a standardized format with additional information
 */
export type StandardXtreamFullEPGListing = {
  /** The unique identifier for the listing */
  id: string;
  /** The EPG ID of the listing */
  epgId: string;
  /** The title of the listing */
  title: string;
  /** The language of the listing */
  language: string;
  /** The start time of the listing */
  start: Date;
  /** The end time of the listing */
  end: Date;
  /** The description of the listing */
  description: string;
  /** The channel ID of the listing */
  channelId: string;
  /** Flag indicating if the listing is currently playing */
  nowPlaying: boolean;
  /** Flag indicating if the listing has an archive available */
  hasArchive: boolean;
};
