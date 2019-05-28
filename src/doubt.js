import Tap from './Tap'
import path from 'path'
import csite from 'callsites'
import equal from 'fast-deep-equal'
import util from 'util'
import 'colors'

const DOUBT = 'DOUBT'
const IS_TRUE = 'IS_TRUE'
const IS_FALSE = 'IS_FALSE'
const IS_EQUAL = 'IS_EQUAL'
const IS_DEEPLY_EQUAL = 'IS_DEEPLY_EQUAL'
const IS_ABOVE = 'IS_ABOVE'
const IS_BELOW = 'IS_BELOW'
const IS_BETWEEN = 'IS_BETWEEN'
const SUCCEEDS = 'SUCCEEDS'
const FAILS = 'FAILS'

class Doubt {
	#doubts = new Map()

	constructor() {
		const doubts = this.#doubts

		String.prototype.doubt = async function(fn) {
			const file = csite()[1].getFileName() |> path.basename
			const set = doubts.get(file) || doubts.set(file, new Set()).get(file)
			set.add({ fn, title: this })
		}

		String.prototype.because = function(a) {
			const at = new Error().stack.split('at ')[3].trim()
			const self = this
			return {
				isTrue() {
					Tap.test(self, !!a, {
						why: `${`${!!a}`.bold.red} should be strictly true`,
						at
					})
				},
				isFalse() {
					Tap.test(self, !a, {
						why: `${`${!a}`.bold.red} should be strictly false`,
						at
					})
				},
				isEqualTo(b) {
					Tap.test(self, a === b, {
						why: `${`${a}`.red.bold} should be strictly equal to ${(b + '').green.bold}`,
						at
					})
				},
				isDeeplyEqualTo(b) {
					Tap.test(self, equal(a, b), {
						why: `${'actual'.red.bold} should be deeply equal to ${'expect'.green.bold}`,
						actual: inspect(a).bold,
						expect: inspect(b).bold,
						at
					})
				},
				isAbove(b) {
					Tap.test(self, a > b, {
						why: `${`${a}`.bold.red} should be above ${`${b}`.bold.green}`,
						at
					})
				},
				isBelow(b) {
					Tap.test(self, a < b, {
						why: `${`${a}`.bold.red} should be below ${`${b}`.bold.green}`,
						at
					})
				},
				isBetween(b, c) {
					Tap.test(self, a >= b && a <= c, {
						why: `${`${a}`.bold.red} should be inclusively in between ${`${b}`.bold.green} and ${
							`${c}`.bold.blue
						}`,
						at
					})
				},
				async succeeds() {
					if (!a instanceof Promise) throw new Error(`${a} is not a promise`)
					try {
						if (typeof a === 'function') await a()
						else await a
						Tap.test(self, true)
					} catch (e) {
						Tap.test(self, false, {
							why: `${`promise`.bold.red} rejected with an error`,
							cause: e?.message.magenta.bold ?? '¯_(ツ)_/¯',
							a
						})
					}
				},
				async fails() {
					if (!a instanceof Promise) throw new Error(`${a} is not a promise`)
					try {
						if (typeof a === 'function') await a()
						else await a
						Tap.test(self, false, {
							why: `${`promise`.bold.red} didn't rejected anything`,
							at
						})
					} catch (e) {
						Tap.test(self, true)
					}
				}
			}
		}
	}

	async run() {
		Tap.version()
		for (let [file, set] of this.#doubts.entries()) {
			;`# ${'___________________________________________'.yellow}
${'RUN..'.bold.black.bgYellow} ${file.white.bold.underline}` |> console.log
			for (let { fn, title } of set) {
				Tap.title(title)
				await fn()
			}
		}
		Tap.end()
	}
}

function inspect(obj) {
	return util.inspect(obj, {
		showHidden: false,
		depth: 2,
		colors: true
	})
}

const doubt = new Doubt()

process.on('beforeExit', async () => {
	await doubt.run()
	process.exit(Tap.shouldFail ? 1 : 0)
})

export default doubt
