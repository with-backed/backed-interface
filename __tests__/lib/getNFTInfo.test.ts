import { convertIPFS, getMimeType, supportedMedia } from 'lib/getNFTInfo';
import fetchMock from 'jest-fetch-mock';
import { captureException } from '@sentry/nextjs';
import { NFTResponseData } from 'pages/api/nftInfo/[uri]';

jest.mock('@sentry/nextjs', () => ({
  ...jest.requireActual('@sentry/nextjs'),
  captureException: jest.fn(),
}));

describe('getNFTInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('getMimeType', () => {
    let response: Response;
    beforeEach(() => {
      jest.clearAllMocks();
      response = new Response();
      fetchMock.mockResolvedValue(response);
    });
    it('returns Content-Type header, when present', async () => {
      const expectedMimeType = 'audio/ogg';
      response.headers.set('Content-Type', expectedMimeType);
      const mimeType = await getMimeType('https://some-fake-url');

      expect(mimeType).toEqual(expectedMimeType);
      expect(captureException).not.toHaveBeenCalled();
    });

    it('returns default content-type, when Content-Type header not present', async () => {
      const expectedMimeType = 'application/octet-stream';
      const mimeType = await getMimeType('https://some-fake-url');

      expect(mimeType).toEqual(expectedMimeType);
      expect(captureException).not.toHaveBeenCalled();
    });

    it('returns default content-type and logs an error, when fetch fails', async () => {
      const expectedMimeType = 'application/octet-stream';
      fetchMock.mockRejectedValue('fail');
      const mimeType = await getMimeType('https://some-fake-url');

      expect(mimeType).toEqual(expectedMimeType);
      expect(captureException).toHaveBeenCalledWith('fail');
    });
  });

  describe('supportedMedia', () => {
    const data: NFTResponseData = {
      name: 'a token',
      description: 'a token',
      tokenId: 8,
      external_url: 'https:some-fake-url',
      image: null,
      animation: null,
    };
    const image = { mediaUrl: 'image', mediaMimeType: 'image' };
    const animation = { mediaUrl: 'animation', mediaMimeType: 'animation' };
    it('throws when there is no associated media', () => {
      expect(() => supportedMedia(data)).toThrow();
    });

    it('returns image when appropriate', () => {
      expect(supportedMedia({ ...data, image, animation }, true)).toEqual(
        image,
      );
      expect(
        supportedMedia({ ...data, image, animation: null }, false),
      ).toEqual(image);
      expect(
        supportedMedia(
          {
            ...data,
            image,
            animation: { ...animation, mediaMimeType: 'text/whatever' },
          },
          false,
        ),
      ).toEqual(image);
    });

    it('returns animation otherwise', () => {
      expect(supportedMedia({ ...data, image, animation })).toEqual(animation);
    });
  });

  describe('convertIPFS', () => {
    it('returns undefined if uri is not defined', () => {
      expect(convertIPFS()).toBeUndefined();
    });

    it('returns uri unchanged if it does not contain a cid', () => {
      expect(convertIPFS('https://google.com')).toEqual('https://google.com');
    });

    it('captures an exception for unreadable input', () => {
      // contains CID, but isn't actually a URL
      expect(
        convertIPFS('QmXuEFJVjQrHX7GRWY2WnbUP59re3WsyDLZoKqXvRPSxBY'),
      ).toEqual('QmXuEFJVjQrHX7GRWY2WnbUP59re3WsyDLZoKqXvRPSxBY');
      expect(captureException).toHaveBeenCalledWith(
        new Error(
          'unsupported URL pattern, please submit a github issue with the URL utilized',
        ),
      );
    });
  });
});
