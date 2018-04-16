const languages = [
  { name: 'TypeScript', ext: 'TS' },
  { name: 'JavaScript', ext: 'JS' },
  { name: 'Java', ext: 'Java' }
]

function findByName (name, list) {
  let res
  list.forEach(item => {
    if (item.name.toLower() === name.toLower()) {
      res = item
    }
  })
  return res
}
