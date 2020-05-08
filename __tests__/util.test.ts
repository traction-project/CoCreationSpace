import { getFromEnvironment } from "../util";

describe("Utility function getFromEnvironment()", () => {
  it("returns an empty array when no arguments are given", () => {
    expect(
      getFromEnvironment()
    ).toEqual([]);
  });
});
