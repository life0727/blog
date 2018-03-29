

function sortByName (peoples) {
  return peoples.sort(function (a, b) {
    return a.name.localCompare(b.name)
  })
}

// sortByName(5)

sortByName(5)
