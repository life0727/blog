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


const languages = [ { name: "TypeScript", ext: "ts"}
                , { name: "JavaScript", ext: "js"}
                , { name: "Java", ext: "java" }
                ]

interface Language {
  name: string
  ext: string
}

function findByName(name: string, elems: Language[]) {
  var elem: Language;
  elems.forEach(function(value, index) {
    if (value.name.toLowerCase() === name.toLowerCase())
      elem = value;
  })
  return elem;
}