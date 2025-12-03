module.exports = {
  computeRange(maxForce) {
    const ranges = [200, 150, 100, 50, 0]
    if (maxForce > 151) maxForce = 151
    if (maxForce < 8) maxForce = 8
    let index = ranges.findIndex((range) => maxForce > 0.9 * range)
    return ranges[index - 1]
  },
  computeVals(range) {
    if (range === 50) {
      return [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
    } else if (range === 100) {
      return [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    } else if (range === 150) {
      return [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150]
    } else {
      return [0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200]
    }
  }
}