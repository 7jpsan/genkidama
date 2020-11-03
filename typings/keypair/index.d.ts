declare module 'keypair' {
  export interface KeypairOptions {
    bits?: number;
    e?: number;
  }
  export interface KeypairResults {
    public: string;
    private: string;
  }

  /**
   * Get an RSA PEM key pair.
   * @param opts
   */
  export default function (opts?: KeypairOptions): KeypairResults;
}
