function replace(pattern, replacer, str) {
  if (replacer === undefined) {
    return (_replacer, _str) => replace(pattern, _replacer, _str)
  } else if (str === undefined) {
    return _str => replace(pattern, replacer, _str)
  }

  return str.replace(pattern, replacer)
}

function remove(inputs, text) {
  if (!Array.isArray(inputs)) {
    return replace(inputs, '', text).trim()
  }

  let textCopy = text

  inputs.forEach(singleInput => {
    textCopy = replace(singleInput, '', textCopy).trim()
  })

  return textCopy
}

function getFirstColumn(input) {
  const [firstColumn] = input.split('</td>')
  if (!firstColumn) return
  const columnContent = firstColumn.split('<td>')
  const foundColumn = remove(
    /<td>/g,
    columnContent[columnContent.length - 1]
  )

  return {
    rest: remove(`<td>${foundColumn}</td>`, input),
    foundColumn,
  }
}

function getFirstRow(input) {
  const [firstRow] = input.split('</tr>')
  if (!firstRow) return
  const rowContent = firstRow.split('<tr>')
  const foundRow = remove(/<tr>/g, rowContent[rowContent.length - 1])
  const rest = remove(`<tr>${foundRow}</tr>`, input)
  if (firstRow.includes('<th>')) return {rest, foundRow: 'SKIP'}
  return {
    rest,
    foundRow,
  }
}

function htmlTable(table, rowIndex, columnIndex) {
  const found = []
  let firstStepReady = false
  let firstStepHolder = table

  Array(50)
    .fill('')
    .forEach(() => {
      const row = []
      if (firstStepReady) return
      const firstStep = getFirstRow(firstStepHolder)
      if (!firstStep) return firstStepReady = true
      if (firstStep.foundRow === '<table></table>')
        return firstStepReady = true
      firstStepHolder = firstStep.rest

      let secondStepReady = false
      let secondStepHolder = firstStep.foundRow
      Array(50)
        .fill('')
        .forEach(() => {
          if (secondStepReady) return
          const secondStep = getFirstColumn(secondStepHolder)
          secondStep
          if (!secondStep) return secondStepReady = true
          row.push(secondStep.foundColumn)
          secondStepHolder = secondStep.rest
        })
      found.push(row)
    })
  if (found[rowIndex] === undefined || found[rowIndex] === 'SKIP')
    return 'No such cell'

  const maybeResult = found[rowIndex][columnIndex]

  return [undefined, 'SKIP'].includes(maybeResult)
    ? 'No such cell'
    : found[rowIndex][columnIndex]
}

test('html table 1', () => {
  const table =
    '<table><tr><td>1</td><td>TWO</td></tr><tr><td>three</td><td>FoUr4</td></tr></table>'
  const row = 0
  const column = 1
  expect(htmlTable(table, row, column)).toEqual('TWO')
})

test('html table 2', () => {
  const table = '<table><tr><td>1</td><td>TWO</td></tr></table>'
  const row = 1
  const column = 0
  expect(htmlTable(table, row, column)).toEqual('No such cell')
})

test('html table 3', () => {
  const table = `<table>
  <tr><th>CIRCUMFERENCE</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th></tr>
  <tr><td>BITS</td><td>3</td><td>4</td><td>8</td><td>10</td><td>12</td><td>15</td></tr>
  </table>`
  const row = 1
  const column = 6
  expect(htmlTable(table, row, column)).toEqual('15')
})

function isSentenceCorrect(sentence) {
  const re = /^[A-Z][^.?!]*[.?!]$/
  return re.test(sentence)
}

test('isSentenceCorrect', () => {
  expect(isSentenceCorrect('Something is !wrong! here.')).toBeFalsy()
  expect(
    isSentenceCorrect('This is an example of *correct* sentence.')
  ).toBeTruthy()
})

function denormalizeTime(x) {
  if (x > 9) return x

  return `0${x}`
}

function normalizeTime(x) {
  const asString = String(x)
  if (asString.length === 2) return asString

  return `0${asString}`
}

function getNextMonth(mm, yyyy) {
  if (mm === '12') {
    return ['01', String(Number(yyyy) + 1)]
  }
  return [String(Number(normalizeTime(mm)) + 1), yyyy]
}

function regularMonths(currMonth) {
  let [mm, yyyy] = currMonth.split('-')
  let found
  const loop = Array(33).fill('')

  loop.forEach((_, i) => {
    if (found !== undefined) return
    ;[mm, yyyy] = getNextMonth(mm, yyyy)
    const newDate = new Date(`${yyyy}-${mm}-01`)
    const day = newDate.getDay()
    if (day === 1) {
      found = `${denormalizeTime(mm)}-${yyyy}`
    }
  })

  return found
}

test('regularMonths', () => {
  expect(regularMonths('09-2099')).toEqual('02-2100')
  // expect(
  //   regularMonths("02-2016")
  // ).toEqual("08-2016")
})

function curiousClock(someTime, leavingTime) {
  const someTimeDate = new Date(someTime)
  const leavingTimeDate = new Date(leavingTime)
  const diff = leavingTimeDate.getTime() - someTimeDate.getTime()
  const answerDate = new Date(someTimeDate.getTime() - diff)
  answerDate
  const yy = answerDate.getFullYear()
  const mm = normalizeTime(answerDate.getMonth() + 1)
  const dd = normalizeTime(answerDate.getDate())
  const hh = normalizeTime(answerDate.getHours())
  const min = normalizeTime(answerDate.getMinutes())
  return `${yy}-${mm}-${dd} ${hh}:${min}`
}

test('curiousClock', () => {
  const someTime = '2016-08-26 22:40'
  const leavingTime = '2016-08-29 10:00'
  const result1 = curiousClock(someTime, leavingTime)
  result1
  expect(result1).toBe('2016-08-24 11:20')
})

function dayOfWeek(birthdayDate) {
  const [dd, mm, yy] = birthdayDate.split`-`
  const asDate = new Date(birthdayDate)
  const day = asDate.getDay()
  const month = asDate.getMonth()

  const result = Array(33)
    .fill('')
    .map((_, i) => {
      const maybeDate = `${dd}-${mm}-${Number(yy) + i + 1}`
      const xDate = new Date(maybeDate)
      return xDate.getDay() === day && xDate.getMonth() === month
    })

  return result.indexOf(true) + 1
}

test('day of week', () => {
  expect(dayOfWeek('02-01-2016')).toBe(5)
  expect(dayOfWeek('02-29-2016')).toBe(28)
})

function getSeconds(input) {
  const [hh, mm, ss] = input.split`:`.map(x =>
    String(x).startsWith('0') ? Number(`${x}`[1]) : Number(x)
  )

  return hh * 3600 + mm * 60 + ss
}

function videoPart(part, whole) {
  const gcm = (a, b) => b === 0 ? a : gcm(b, a % b)
  const partSeconds = getSeconds(part)
  const wholeSeconds = getSeconds(whole)
  const d = gcm(partSeconds, wholeSeconds)
  return [partSeconds / d, wholeSeconds / d]
}

test('video part', () => {
  expect(getSeconds('01:01:01')).toBe(3661)
  expect(videoPart('07:32:29', '10:12:51')).toEqual([1597, 2163])
})

function validTime(time) {
  const [hh, mm] = time.split`:`.map(x => ({str: x, num: +x}))
  if (hh.num > 24 || hh.str.length !== 2) return false
  if (mm.num > 60 || mm.str.length !== 2) return false
  return true
}

test('valid time', () => {
  expect(validTime('25:51')).toBe(false)
  expect(validTime('24:51')).toBe(true)
  expect(validTime('23:51')).toBe(true)
  expect(validTime('02:51')).toBe(true)
  expect(validTime('00:51')).toBe(true)
})

function getProductOfDigits(input) {
  const x = `${input}`
  if (x.length === 1) return input

  return x.split``.reduce((prev, current) => prev * Number(current), 1)
}

function uniqueDigitProducts(input) {
  const products = input.map(getProductOfDigits)
  const uniqProducts = []
  products.forEach(x => {
    if (!uniqProducts.includes(x)) uniqProducts.push(x)
  })
  return uniqProducts.length
}

test('unique digit products', () => {
  const result = uniqueDigitProducts([2, 8, 121, 42, 222, 23])
  expect(result).toBe(3)
})

function calculateNumberScore(input) {
  const x = `${input}`.split``

  if (x.length === 1) return 0
  if (x.length === 2) return Math.abs(Number(x[0]) - Number(x[1]))
  const sorted = x.sort((a, b) => a < b ? 1 : -1)

  return Math.abs(Number(sorted[0]) - Number(sorted[sorted.length - 1]))
}

function digitDifferenceSort(input) {
  return input
    .map((x, i) => ({x, i}))
    .sort((a, b) => {
      const scoreA = calculateNumberScore(a.x)
      const scoreB = calculateNumberScore(b.x)
      const direction = scoreA === scoreB ? a.i > b.i : scoreA < scoreB

      return direction ? -1 : 1
    })
    .map(({x}) => x)
}

test('calc num score', () => {
  expect(calculateNumberScore(7)).toBe(0)
  expect(calculateNumberScore(17)).toBe(6)
  expect(calculateNumberScore(71)).toBe(6)
  expect(calculateNumberScore(721)).toBe(6)
  expect(calculateNumberScore(217)).toBe(6)
})

test('happy', () => {
  const input = [152, 23, 7, 887, 243]
  const expected = [7, 887, 23, 243, 152]

  expect(digitDifferenceSort(input)).toEqual(expected)
})