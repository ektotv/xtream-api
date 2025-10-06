import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { Xtream } from '../src/main.ts';
import { camelCaseSerializer } from '../src/serializers/camelcase.ts';
import { JSONAPISerializer } from '../src/serializers/jsonapi.ts';
import { standardizedSerializer } from '../src/serializers/standardized.ts';
import { server } from './msw.ts';

// Setup MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

expect.addSnapshotSerializer({
  serialize(val) {
    return JSON.stringify(val, null, 2) + '\n';
  },
  test(val) {
    return val && (typeof val === 'object' || Array.isArray(val));
  },
});

// default Xtream instance
const noSerializerXtream = new Xtream({
  url: 'http://example.com',
  username: 'test',
  password: 'password',
});

// JSON:API serializer
const jsonApiSerializerXtream = new Xtream({
  url: 'http://example.com',
  username: 'test',
  password: 'password',
  serializer: JSONAPISerializer,
});

// Camel case serializer
const camelCaseSerializerXtream = new Xtream({
  url: 'http://example.com',
  username: 'test',
  password: 'password',
  serializer: camelCaseSerializer,
});

// Standardized serializer
const standardizedSerializerXtream = new Xtream({
  url: 'http://example.com',
  username: 'test',
  password: 'password',
  serializer: standardizedSerializer,
});

describe('Xtream API', () => {
  test('errors when no options are provided', () => {
    expect(() => new Xtream({} as any)).toThrow('The Xtream URL is required');
  });

  test('errors when no auth details are provided', () => {
    expect(() => new Xtream({ url: 'http://example.com' } as any)).toThrow(
      'The authentication credentials are required',
    );
  });

  test('errors when no only username is provided', () => {
    expect(() => new Xtream({ url: 'http://example.com', username: 'test' } as any)).toThrow(
      'The authentication credentials are required',
    );
  });

  test('Class is initialized correctly', () => {
    expect(noSerializerXtream).toBeDefined();
    expect(noSerializerXtream).toBeInstanceOf(Xtream);
  });

  test('getProfile returns the user profile', async () => {
    const profile = await noSerializerXtream.getProfile();

    await expect(profile).toMatchFileSnapshot('snapshots/raw/profile.json');
  });

  test('can filter channels by category ID', async () => {
    const channels = await noSerializerXtream.getChannels({
      categoryId: '2',
    });

    expect(channels.length).toBe(1);
  });

  test('can filter movies by category ID', async () => {
    const movies = await noSerializerXtream.getMovies({
      categoryId: '2',
    });

    expect(movies.length).toBe(1);
  });

  test('can filter shows by category ID', async () => {
    const shows = await noSerializerXtream.getShows({
      categoryId: '2',
    });

    expect(shows.length).toBe(1);
  });

  test('filter can be number', async () => {
    const [channels, movies, shows] = await Promise.all([
      noSerializerXtream.getChannels({
        categoryId: 2,
      }),
      noSerializerXtream.getMovies({
        categoryId: 2,
      }),
      noSerializerXtream.getShows({
        categoryId: 2,
      }),
    ]);

    expect(channels.length).toBe(1);
    expect(movies.length).toBe(1);
    expect(shows.length).toBe(1);
  });

  test('getServerInfo returns the server information', async () => {
    const serverInfo = await noSerializerXtream.getServerInfo();

    await expect(serverInfo).toMatchFileSnapshot('snapshots/raw/server-info.json');
  });

  test('getChannels returns the list of channels', async () => {
    const channels = await noSerializerXtream.getChannels();

    await expect(channels).toMatchFileSnapshot('snapshots/raw/channels.json');
  });

  test('getChannels can be paged', async () => {
    const channels = await noSerializerXtream.getChannels({ page: 1, limit: 1 });
    const channels2 = await noSerializerXtream.getChannels({ page: 2, limit: 1 });

    expect(channels.length).toBe(1);
    expect(channels2.length).toBe(1);

    await expect(channels).toMatchFileSnapshot('snapshots/raw/channels-page1.json');
    await expect(channels2).toMatchFileSnapshot('snapshots/raw/channels-page2.json');
  });

  test('getChannelCategories returns the list of categories', async () => {
    const categories = await noSerializerXtream.getChannelCategories();

    await expect(categories).toMatchFileSnapshot('snapshots/raw/categories.json');
  });

  test('getMovieCategories returns the list of categories', async () => {
    const categories = await noSerializerXtream.getMovieCategories();

    await expect(categories).toMatchFileSnapshot('snapshots/raw/movie-categories.json');
  });

  test('getShowCategories returns the list of categories', async () => {
    const categories = await noSerializerXtream.getShowCategories();

    await expect(categories).toMatchFileSnapshot('snapshots/raw/show-categories.json');
  });

  test('getMovies returns the list of movies', async () => {
    const movies = await noSerializerXtream.getMovies();

    await expect(movies).toMatchFileSnapshot('snapshots/raw/movies.json');
  });

  test('getMovies can be paged', async () => {
    const movies = await noSerializerXtream.getMovies({ page: 1, limit: 1 });

    expect(movies.length).toBe(1);

    await expect(movies).toMatchFileSnapshot('snapshots/raw/movies-page1.json');
  });

  test('getMovie returns the movie information', async () => {
    const movie = await noSerializerXtream.getMovie({ movieId: '1' });

    await expect(movie).toMatchFileSnapshot('snapshots/raw/movie.json');
  });

  test('getShows returns the list of shows', async () => {
    const shows = await noSerializerXtream.getShows();

    await expect(shows).toMatchFileSnapshot('snapshots/raw/shows.json');
  });

  test('getShows can be paged', async () => {
    const shows = await noSerializerXtream.getShows({ page: 1, limit: 1 });

    expect(shows.length).toBe(1);

    await expect(shows).toMatchFileSnapshot('snapshots/raw/shows-page1.json');
  });

  test('getShow returns the show details', async () => {
    const show = await noSerializerXtream.getShow({ showId: '1' });

    await expect(show).toMatchFileSnapshot('snapshots/raw/show.json');
  });

  test('Can set preferred format for streams', async () => {
    const formatXtream = new Xtream({
      url: 'http://example.com',
      username: 'test',
      password: 'password',
      preferredFormat: 'm3u8',
    });

    const stream = await formatXtream.getChannels({ page: 1, limit: 1 });

    expect(stream[0].url).toBe('http://example.com/live/test/password/1.m3u8');
  });

  test('If preferred format is disallowed fallback to default in allowed list', async () => {
    const formatXtream = new Xtream({
      url: 'http://example.com',
      username: 'test',
      password: 'password',
      // @ts-expect-error: this should fail due to type checking
      preferredFormat: 'nono',
    });

    const stream = await formatXtream.getChannels({ page: 1, limit: 1 });

    expect(stream[0].url).toBe('http://example.com/live/test/password/1.m3u8');
  });

  test('Preferred format rtmp returns mpeg-ts', async () => {
    const formatXtream = new Xtream({
      url: 'http://example.com',
      username: 'test',
      password: 'password',
      preferredFormat: 'rtmp',
    });

    const stream = await formatXtream.getChannels({ page: 1, limit: 1 });

    expect(stream[0].url).toBe('http://example.com/live/test/password/1.ts');
  });

  test('Movie listing gets correct url', async () => {
    const movies = await noSerializerXtream.getMovies({ page: 1, limit: 1 });

    expect(movies[0].url).toBe('http://example.com/movie/test/password/935703.mp4');
  });

  test('URL is undefined when input to generateStreamUrl is broken', () => {
    // @ts-expect-error
    const broken = noSerializerXtream.generateStreamUrl({ a: 'broken' });

    expect(broken).toBeUndefined();
  });

  test('Can request timeshifted channel URL', () => {
    const url = noSerializerXtream.generateStreamUrl({
      type: 'channel',
      streamId: '1',
      extension: 'ts',
      timeshift: { duration: 60, start: new Date('2021-01-01T00:00:00Z') },
    });

    expect(url).toBe('http://example.com/timeshift/test/password/60/2021-01-01:00-00/1.ts');
  });

  test('Falls back to requested extension when userProfile has empty allowed_output_formats', async () => {
    const xtream = new Xtream({
      url: 'http://example.com',
      username: 'test',
      password: 'password',
    });

    // Set userProfile with empty allowed_output_formats array
    xtream.userProfile = {
      username: 'test',
      password: 'password',
      message: '',
      auth: 1,
      status: 'Active',
      exp_date: '1767542400',
      is_trial: '0',
      active_cons: 0,
      created_at: '1735084800',
      max_connections: '5',
      allowed_output_formats: [],
    };

    const url = xtream.generateStreamUrl({
      type: 'channel',
      streamId: '123',
      extension: 'm3u8',
    });

    expect(url).toBe('http://example.com/live/test/password/123.m3u8');
  });

  test('Falls back to requested extension when userProfile is undefined', () => {
    const xtream = new Xtream({
      url: 'http://example.com',
      username: 'test',
      password: 'password',
    });

    // Ensure userProfile is undefined
    xtream.userProfile = undefined;

    const url = xtream.generateStreamUrl({
      type: 'channel',
      streamId: '456',
      extension: 'ts',
    });

    expect(url).toBe('http://example.com/live/test/password/456.ts');
  });
});

describe('JSON:API serializer', () => {
  test('serializerType is "JSON:API"', () => {
    expect(jsonApiSerializerXtream.serializerType).toBe('JSON:API');
  });

  test('getProfile returns the user profile', async () => {
    const profile = await jsonApiSerializerXtream.getProfile();

    await expect(profile).toMatchFileSnapshot('snapshots/jsonapi/profile.json');
  });

  test('getServerInfo returns the server information', async () => {
    const serverInfo = await jsonApiSerializerXtream.getServerInfo();

    await expect(serverInfo).toMatchFileSnapshot('snapshots/jsonapi/server-info.json');
  });

  test('getChannels returns the list of channels', async () => {
    const channels = await jsonApiSerializerXtream.getChannels();

    await expect(channels).toMatchFileSnapshot('snapshots/jsonapi/channels.json');
  });

  test('getChannelCategories returns the list of categories', async () => {
    const categories = await jsonApiSerializerXtream.getChannelCategories();

    await expect(categories).toMatchFileSnapshot('snapshots/jsonapi/categories.json');
  });

  test('getMovieCategories returns the list of categories', async () => {
    const categories = await jsonApiSerializerXtream.getMovieCategories();

    await expect(categories).toMatchFileSnapshot('snapshots/jsonapi/movie-categories.json');
  });

  test('getShowCategories returns the list of categories', async () => {
    const categories = await jsonApiSerializerXtream.getShowCategories();

    await expect(categories).toMatchFileSnapshot('snapshots/jsonapi/show-categories.json');
  });

  test('getMovies returns the list of movies', async () => {
    const movies = await jsonApiSerializerXtream.getMovies();

    await expect(movies).toMatchFileSnapshot('snapshots/jsonapi/movies.json');
  });

  test('getMovie returns the movie information', async () => {
    const movie = await jsonApiSerializerXtream.getMovie({ movieId: 1 });

    await expect(movie).toMatchFileSnapshot('snapshots/jsonapi/movie.json');
  });

  test('getShows returns the list of shows', async () => {
    const shows = await jsonApiSerializerXtream.getShows();

    await expect(shows).toMatchFileSnapshot('snapshots/jsonapi/shows.json');
  });

  test('getShow returns the show details', async () => {
    const show = await jsonApiSerializerXtream.getShow({ showId: '1' });

    await expect(show).toMatchFileSnapshot('snapshots/jsonapi/show.json');
  });

  test('We generate seasons if no seasons are provided by the API', async () => {
    const show = await jsonApiSerializerXtream.getShow({ showId: '3000' });

    await expect(show).toMatchFileSnapshot('snapshots/jsonapi/show-no-seasons.json');
  });

  test('Handles null values for movies', async () => {
    const xtream = new Xtream({
      url: 'http://example.com',
      username: 'gonull',
      password: 'password',
      serializer: JSONAPISerializer,
    });

    const movies = await xtream.getMovies();

    expect(movies.data[0].attributes.plot).toBeNull();
    expect(movies.data[0].attributes.director).toEqual([]);
    expect(movies.data[0].attributes.cast).toEqual([]);
    expect(movies.data[0].attributes.genre).toEqual([]);
    expect(movies.data[0].attributes.releaseDate).toBeNull();
    expect(movies.data[0].attributes.youtubeId).toBeNull();
    expect(movies.data[0].attributes.duration).toBe(0);
  });
});

describe('Camel case serializer', () => {
  test('serializerType is "Camel Case"', () => {
    expect(camelCaseSerializerXtream.serializerType).toBe('Camel Case');
  });

  test('getProfile returns the user profile', async () => {
    const profile = await camelCaseSerializerXtream.getProfile();

    await expect(profile).toMatchFileSnapshot('snapshots/camelcase/profile.json');
  });

  test('getServerInfo returns the server information', async () => {
    const serverInfo = await camelCaseSerializerXtream.getServerInfo();

    await expect(serverInfo).toMatchFileSnapshot('snapshots/camelcase/server-info.json');
  });

  test('getChannels returns the list of channels', async () => {
    const channels = await camelCaseSerializerXtream.getChannels();

    await expect(channels).toMatchFileSnapshot('snapshots/camelcase/channels.json');
  });

  test('getChannelCategories returns the list of categories', async () => {
    const categories = await camelCaseSerializerXtream.getChannelCategories();

    await expect(categories).toMatchFileSnapshot('snapshots/camelcase/categories.json');
  });

  test('getMovieCategories returns the list of categories', async () => {
    const categories = await camelCaseSerializerXtream.getMovieCategories();

    await expect(categories).toMatchFileSnapshot('snapshots/camelcase/movie-categories.json');
  });

  test('getShowCategories returns the list of categories', async () => {
    const categories = await camelCaseSerializerXtream.getShowCategories();

    await expect(categories).toMatchFileSnapshot('snapshots/camelcase/show-categories.json');
  });

  test('getMovies returns the list of movies', async () => {
    const movies = await camelCaseSerializerXtream.getMovies();

    await expect(movies).toMatchFileSnapshot('snapshots/camelcase/movies.json');
  });

  test('getMovie returns the movie information', async () => {
    const movie = await camelCaseSerializerXtream.getMovie({ movieId: 1 });

    await expect(movie).toMatchFileSnapshot('snapshots/camelcase/movie.json');
  });

  test('getShows returns the list of shows', async () => {
    const shows = await camelCaseSerializerXtream.getShows();

    await expect(shows).toMatchFileSnapshot('snapshots/camelcase/shows.json');
  });

  test('getShow returns the show details', async () => {
    const show = await camelCaseSerializerXtream.getShow({ showId: '1' });

    await expect(show).toMatchFileSnapshot('snapshots/camelcase/show.json');
  });

  test('Handles null values for movies', async () => {
    const xtream = new Xtream({
      url: 'http://example.com',
      username: 'gonull',
      password: 'password',
      serializer: camelCaseSerializer,
    });

    const movies = await xtream.getMovies();

    expect(movies[0].plot).toBeNull();
    expect(movies[0].director).toBeNull();
    expect(movies[0].cast).toBeNull();
    expect(movies[0].genre).toBeNull();
    expect(movies[0].releaseDate).toBeNull();
    expect(movies[0].youtubeTrailer).toBeNull();
    expect(movies[0].episodeRunTime).toBeNull();
  });
});

describe('Standardized serializer', () => {
  test('serializerType is "Standardized"', () => {
    expect(standardizedSerializerXtream.serializerType).toBe('Standardized');
  });

  test('getProfile returns the user profile', async () => {
    const profile = await standardizedSerializerXtream.getProfile();

    await expect(profile).toMatchFileSnapshot('snapshots/standardized/profile.json');
  });

  test('getServerInfo returns the server information', async () => {
    const serverInfo = await standardizedSerializerXtream.getServerInfo();

    await expect(serverInfo).toMatchFileSnapshot('snapshots/standardized/server-info.json');
  });

  test('getChannels returns the list of channels', async () => {
    const channels = await standardizedSerializerXtream.getChannels();

    await expect(channels).toMatchFileSnapshot('snapshots/standardized/channels.json');
  });

  test('getChannelCategories returns the list of categories', async () => {
    const categories = await standardizedSerializerXtream.getChannelCategories();

    await expect(categories).toMatchFileSnapshot('snapshots/standardized/categories.json');
  });

  test('getMovieCategories returns the list of categories', async () => {
    const categories = await standardizedSerializerXtream.getMovieCategories();

    await expect(categories).toMatchFileSnapshot('snapshots/standardized/movie-categories.json');
  });

  test('getShowCategories returns the list of categories', async () => {
    const categories = await standardizedSerializerXtream.getShowCategories();

    await expect(categories).toMatchFileSnapshot('snapshots/standardized/show-categories.json');
  });

  test('getMovies returns the list of movies', async () => {
    const movies = await standardizedSerializerXtream.getMovies();

    await expect(movies).toMatchFileSnapshot('snapshots/standardized/movies.json');
  });

  test('getMovie returns the movie information', async () => {
    const movie = await standardizedSerializerXtream.getMovie({ movieId: '1' });

    await expect(movie).toMatchFileSnapshot('snapshots/standardized/movie.json');
  });

  test('getShows returns the list of shows', async () => {
    const shows = await standardizedSerializerXtream.getShows();

    await expect(shows).toMatchFileSnapshot('snapshots/standardized/shows.json');
  });

  test('getShow returns the show details', async () => {
    const show = await standardizedSerializerXtream.getShow({ showId: '1' });

    await expect(show).toMatchFileSnapshot('snapshots/standardized/show.json');
  });

  test('We generate seasons if no seasons are provided by the API', async () => {
    const show = await standardizedSerializerXtream.getShow({ showId: '3000' });

    await expect(show).toMatchFileSnapshot('snapshots/standardized/show-no-seasons.json');
  });

  test('Handles null values for movies', async () => {
    const xtream = new Xtream({
      url: 'http://example.com',
      username: 'gonull',
      password: 'password',
      serializer: standardizedSerializer,
    });

    const movies = await xtream.getMovies();

    expect(movies[0].plot).toBeNull();
    expect(movies[0].cast).toEqual([]);
    expect(movies[0].director).toEqual([]);
    expect(movies[0].genre).toEqual([]);
    expect(movies[0].releaseDate).toBeNull();
    expect(movies[0].youtubeId).toBeNull();
    expect(movies[0].duration).toBe(0);
  });
});

describe('EPG', () => {
  test('getShortEPG returns the EPG data', async () => {
    const epg = await noSerializerXtream.getShortEPG({
      channelId: '1',
    });

    expect(epg.epg_listings.length).toBe(4);
  });

  test('getShortEPG can be limited', async () => {
    const epg = await noSerializerXtream.getShortEPG({
      channelId: '1',
      limit: 2,
    });

    expect(epg.epg_listings.length).toBe(2);
  });

  test('getFullEPG returns the full EPG data', async () => {
    const epg = await noSerializerXtream.getFullEPG({
      channelId: '1',
    });

    expect(epg.epg_listings.length).toBe(10);
  });

  test('JSON:API serializer shortEPG returns the EPG data', async () => {
    const epg = await jsonApiSerializerXtream.getShortEPG({
      channelId: '1',
    });

    expect(epg.data.length).toBe(4);
  });

  test('Camel case serializer shortEPG returns the EPG data', async () => {
    const epg = await camelCaseSerializerXtream.getShortEPG({
      channelId: '1',
    });

    expect(epg.epgListings.length).toBe(4);
  });

  test('Standardized serializer shortEPG returns the EPG data', async () => {
    const epg = await standardizedSerializerXtream.getShortEPG({
      channelId: '1',
    });

    expect(epg.length).toBe(4);
  });

  test('JSON:API serializer decodes base64 title and description', async () => {
    const epg = await jsonApiSerializerXtream.getShortEPG({
      channelId: '1',
    });

    expect(epg.data[0].attributes.title).toBe('fake programme');
    expect(epg.data[0].attributes.description).toBe('fake description');
  });

  test('Standardized serializer decodes base64 title and description', async () => {
    const epg = await standardizedSerializerXtream.getShortEPG({
      channelId: '1',
    });

    expect(epg[0].title).toBe('fake programme');
    expect(epg[0].description).toBe('fake description');
  });

  test('raw serializer matches short snapshot', async () => {
    const epg = await noSerializerXtream.getShortEPG({
      channelId: '1',
    });

    await expect(epg).toMatchFileSnapshot('snapshots/raw/short-epg.json');
  });

  test('JSON:API serializer matches short snapshot', async () => {
    const epg = await jsonApiSerializerXtream.getShortEPG({
      channelId: '1',
    });

    await expect(epg).toMatchFileSnapshot('snapshots/jsonapi/short-epg.json');
  });

  test('Camel case serializer matches short snapshot', async () => {
    const epg = await camelCaseSerializerXtream.getShortEPG({
      channelId: '1',
    });

    await expect(epg).toMatchFileSnapshot('snapshots/camelcase/short-epg.json');
  });

  test('Standardized serializer matches short snapshot', async () => {
    const epg = await standardizedSerializerXtream.getShortEPG({
      channelId: '1',
    });

    await expect(epg).toMatchFileSnapshot('snapshots/standardized/short-epg.json');
  });

  test('raw serializer matches full snapshot', async () => {
    const epg = await noSerializerXtream.getFullEPG({
      channelId: '1',
    });

    await expect(epg).toMatchFileSnapshot('snapshots/raw/full-epg.json');
  });

  test('JSON:API serializer matches full snapshot', async () => {
    const epg = await jsonApiSerializerXtream.getFullEPG({
      channelId: '1',
    });

    await expect(epg).toMatchFileSnapshot('snapshots/jsonapi/full-epg.json');
  });

  test('Camel case serializer matches full snapshot', async () => {
    const epg = await camelCaseSerializerXtream.getFullEPG({
      channelId: '1',
    });

    await expect(epg).toMatchFileSnapshot('snapshots/camelcase/full-epg.json');
  });

  test('Standardized serializer matches full snapshot', async () => {
    const epg = await standardizedSerializerXtream.getFullEPG({
      channelId: '1',
    });

    await expect(epg).toMatchFileSnapshot('snapshots/standardized/full-epg.json');
  });

  test('Handles empty EPG data', async () => {
    const [epg, jsonApiEpg, camelCaseEpg, standardizedEpg] = await Promise.all([
      noSerializerXtream.getShortEPG({
        channelId: '1000',
      }),
      jsonApiSerializerXtream.getShortEPG({
        channelId: '1000',
      }),
      camelCaseSerializerXtream.getShortEPG({
        channelId: '1000',
      }),
      standardizedSerializerXtream.getShortEPG({
        channelId: '1000',
      }),
    ]);

    expect(epg.epg_listings.length).toBe(0);
    expect(jsonApiEpg.data.length).toBe(0);
    expect(camelCaseEpg.epgListings.length).toBe(0);
    expect(standardizedEpg.length).toBe(0);
  });
});

describe('Errors', () => {
  test('404 on wrong credentials', async () => {
    const xtream = new Xtream({
      url: 'http://example.com',
      username: 'error',
      password: 'wrongpassword',
    });

    await expect(xtream.getProfile()).rejects.toThrowError('Not Found');
  });

  test('Series not found', async () => {
    await expect(noSerializerXtream.getShow({ showId: '1000' })).rejects.toThrowError('Show Not Found');
  });

  test('Movie not found', async () => {
    await expect(noSerializerXtream.getMovie({ movieId: '1000' })).rejects.toThrowError('Movie Not Found');
  });
});
