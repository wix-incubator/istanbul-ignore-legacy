import { TempDir } from "./TempDir";
import { runTool } from "./testHelpers";

describe("", () => {
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

  it("when the second function is uncovered", async () => {
    const file = `
            module.exports = function a() {
                
            };

            function b() {
            }
        `;

    const result = await runTool(tempDir, file, callOnlyA);
    const expectedCodeFile = `
            module.exports = function a() {
                
            };

/* istanbul ignore next */
            function b() {
            }
        `;

    expect(result).toEqual(expectedCodeFile);
  });

  it("when the second function is uncovered", async () => {
    const file = `
            function c() {
            }
            
            module.exports = function a() {
                
            };`;

    const result = await runTool(tempDir, file, callOnlyA);

    const expectedCodeFile = `
/* istanbul ignore next */
            function c() {
            }
            
            module.exports = function a() {
                
            };`;

    expect(result).toEqual(expectedCodeFile);
  });
});
