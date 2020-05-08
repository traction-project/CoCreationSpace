import { getFromEnvironment } from "../util";

describe("Utility function getFromEnvironment()", () => {
  it("returns an empty array when no arguments are given", () => {
    expect(
      getFromEnvironment()
    ).toEqual([]);
  });

  it("should throw an error when requesting something from empty environment", () => {
    expect(() => {
      getFromEnvironment("SOME_KEY");
    }).toThrow();
  });
});
