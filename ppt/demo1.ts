
const languages = [
  { name: "TypeScript", ext: "ts"},
  { name: "JavaScript", ext: "js"},
  { name: "Java", ext: "java" }
]

interface Language {
  name: string
  ext: string
}

function findByName(name: string, elems: Language[]) {
  var elem: Language;
  elems.forEach(function(value, index) {
    if (value.name.toLower() === name.toLower())
      elem = value;
  })
  return elem;
}