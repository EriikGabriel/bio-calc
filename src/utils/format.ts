export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "")
}

export function formatCNPJ(value: string): string {
  const digits = onlyDigits(value).slice(0, 14)
  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 5),
    digits.slice(5, 8),
    digits.slice(8, 12),
    digits.slice(12, 14),
  ]
  let out = ""
  if (parts[0]) out = parts[0]
  if (parts[1]) out += `.${parts[1]}`
  if (parts[2]) out += `.${parts[2]}`
  if (parts[3]) out += `/${parts[3]}`
  if (parts[4]) out += `-${parts[4]}`
  return out
}

export function formatPhoneBR(value: string): string {
  const digits = onlyDigits(value).slice(0, 11)
  const ddd = digits.slice(0, 2)

  const isEleven = digits.length > 10
  const part1 = digits.slice(2, isEleven ? 7 : 6)
  const part2 = digits.slice(isEleven ? 7 : 6)
  let out = ""

  if (ddd) out = `(${ddd}`
  if (ddd.length === 2) out += ") "
  if (part1) out += part1
  if (part2) out += `-${part2}`

  return out
}
