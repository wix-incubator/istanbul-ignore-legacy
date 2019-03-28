/* tslint:disable:no-big-function */
import { TempDir } from './TempDir';
import { runTool } from './testHelpers';

describe('Branches', () => {
  let tempDir;
  beforeEach(() => {
    tempDir = new TempDir();
  });
  afterEach(() => {
    tempDir.destroy();
  });

  const callOnlyA = `
            const a = require('./codeFile.js');
            
            
            describe('', () => {
                it('should', () => {
                    a();
                    expect(true).toBe(true)
                });
            });
  
        `;

  describe('if', () => {
    it('when only if is covered', async () => {
      const file = `
            module.exports = function a() {
                if (true) {
                
                }
            };
        `;

      const result = await runTool(tempDir, file, callOnlyA);
      const expectedCodeFile = `
            module.exports = function a() {
/* istanbul ignore else */
                if (true) {
                
                }
            };
        `;

      expect(result).toEqual(expectedCodeFile);
    });

    it('when only else is covered', async () => {
      const file = `
            module.exports = function a() {
                if (false) {
                
                }
            };
        `;

      const result = await runTool(tempDir, file, callOnlyA);
      const expectedCodeFile = `
            module.exports = function a() {
/* istanbul ignore if */
                if (false) {
                
                }
            };
        `;

      expect(result).toEqual(expectedCodeFile);
    });

    it('TS - when is not called', async () => {
      const file = `
            export default function a() {};
            
            export function b() {
                if (true) {
                }
            }
            
        `;

      const result = await runTool(
        tempDir,
        file,
        `import A from './codeFile'; describe('', () => {
      it('', () => {A()})
      })`,
        true
      );
      const expectedCodeFile = `
            export default function a() {};
            
/* istanbul ignore next */
            export function b() {
                if (true) {
                }
            }
            
        `;

      expect(result).toEqual(expectedCodeFile);
    });
  });

  describe('ternary', () => {
    it('when only if is covered', async () => {
      const file = `
            module.exports = function a() {
                return true ? 1 : 0;
            };
        `;

      const result = await runTool(tempDir, file, callOnlyA);
      const expectedCodeFile = `
            module.exports = function a() {
                return/* istanbul ignore next */ true ? 1 : 0;
            };
        `;

      expect(result).toEqual(expectedCodeFile);
    });

    it('when only else is covered', async () => {
      const file = `
            module.exports = function a() {
                return false ? 1 : 0;
            };
        `;

      const result = await runTool(tempDir, file, callOnlyA);
      const expectedCodeFile = `
            module.exports = function a() {
                return/* istanbul ignore next */ false ? 1 : 0;
            };
        `;

      expect(result).toEqual(expectedCodeFile);
    });

    it('when is not called', async () => {
      const file = `
            module.exports = function a() {};
            
            function b() {
                return true ? 1 : 0;
            }
            
        `;

      const result = await runTool(tempDir, file, callOnlyA);
      const expectedCodeFile = `
            module.exports = function a() {};
            
/* istanbul ignore next */
            function b() {
                return true ? 1 : 0;
            }
            
        `;

      expect(result).toEqual(expectedCodeFile);
    });
  });

  describe('Typescript', () => {
    it('TS - when ternary if', async () => {
      const file = `
      export default function a() {
            return         true    ? 343241 : 4324324322
            };
      `;

      const result = await runTool(
        tempDir,
        file,
        `import A from './codeFile'; describe('', () => { it('', () => {A()}) })`,
        true
      );
      const expectedCodeFile = `
      export default function a() {
            return/* istanbul ignore next */         true    ? 343241 : 4324324322
            };
      `;

      expect(result).toEqual(expectedCodeFile);
    });

    it('TS - when ternary if with tsx', async () => {
      const file = `
import * as React from 'react';
      export default function a() {
            const myA = new A();
            myA.render();
            };
            
      class A {         
            public render() {
            return true ? null : <div></div>;
      }
  }
      `;

      const result = await runTool(
        tempDir,
        file,
        `import A from './codeFile'; describe('', () => { it('', () => {A()}) })`,
        true,
        true
      );
      const expectedCodeFile = `
import * as React from 'react';
      export default function a() {
            const myA = new A();
            myA.render();
            };
            
      class A {         
            public render() {
            return/* istanbul ignore next */ true ? null : <div></div>;
      }
  }
      `;

      expect(result).toEqual(expectedCodeFile);
    });

    it('TS - when ternary if with function call inside', async () => {
      const file = `
import * as React from 'react';
      export default function a() {
            const myA = new A();
            myA.render();
            };
            
      class A {         
            public render() {
            return true ? console.log() : <div></div>;
      }
  }
      `;

      const result = await runTool(
        tempDir,
        file,
        `import A from './codeFile'; describe('', () => { it('', () => {A()}) })`,
        true,
        true
      );
      const expectedCodeFile = `
import * as React from 'react';
      export default function a() {
            const myA = new A();
            myA.render();
            };
            
      class A {         
            public render() {
            return/* istanbul ignore next */ true ? console.log() : <div></div>;
      }
  }
      `;

      expect(result).toEqual(expectedCodeFile);
    });

    it('default arg', async () => {
      const file = `
        export default function a({
          cssPath
        }: {cssPath?: string[]} = {}) {}
      `;

      const result = await runTool(
        tempDir,
        file,
        `import A from './codeFile'; describe('', () => { it('', () => {A()}) })`,
        true,
        true
      );
      const expectedCodeFile = `/* istanbul ignore next */
        export default function a({
          cssPath
        }: {cssPath?: string[]} = {}) {}
      `;

      expect(result).toEqual(expectedCodeFile);
    });
  });
});
