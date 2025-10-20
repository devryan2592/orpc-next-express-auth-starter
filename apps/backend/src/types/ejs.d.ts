declare module 'ejs' {
  interface Options {
    filename?: string;
    root?: string;
    views?: string[];
    cache?: boolean;
    debug?: boolean;
    compileDebug?: boolean;
    client?: boolean;
    delimiter?: string;
    openDelimiter?: string;
    closeDelimiter?: string;
    strict?: boolean;
    _with?: boolean;
    localsName?: string;
    rmWhitespace?: boolean;
    escape?: (markup?: any) => string;
    outputFunctionName?: string;
    async?: boolean;
  }

  function render(template: string, data?: object, options?: Options): string;
  function renderFile(path: string, data?: object, options?: Options): Promise<string>;
  function renderFile(path: string, data: object, options: Options, callback: (err: Error | null, html?: string) => void): void;
  function renderFile(path: string, data: object, callback: (err: Error | null, html?: string) => void): void;
  function renderFile(path: string, callback: (err: Error | null, html?: string) => void): void;
  
  function compile(template: string, options?: Options): (data?: object) => string;
  
  export = {
    render,
    renderFile,
    compile
  };
}