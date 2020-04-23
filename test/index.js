import * as _ from './'
import Doubt from '../src'
import tap_spec from 'tap-spec-emoji'
import { pipeline } from 'stream'

pipeline(Doubt.stream(), tap_spec(), process.stdout, error => { if (error) console.log(error) })

'hydre/doubt is awesome'.doubt(async () => {
  'isTrue'.because(true).isTrue()
  'isUndefined'.because(undefined).isUndefined()
  'isDefined'.because('').isDefined()
  'isFalse'.because(false).isFalse()
  'isEqualTo'.because(1).isEqualTo(1)
  'isNotEqualTo'.because(0).isNotEqualTo(1)
  'isDeeplyEqualTo'.because({ a: { a: 1 } }).isDeeplyEqualTo({ a: { a: 1 } })
  'isAbove'.because(1).isAbove(0)
  'isBelow'.because(0).isBelow(1)
  'isBetween'.because(0).isBetween(0, 1)
  'isNaN'.because(NaN).isNaN()
  'isTypeOf'.because(1).isTypeOf('number')
  'hasKeys'.because({ e: NaN, b: 1 }).hasKeys(['e'])

  'pass'.because(() => { }).pass()
  'fails'.because(() => { throw 'something' }).fails()

  class NiggaError extends Error { }
  'failsWith'.because(() => { throw 'NiggaError' }).failsWith(new NiggaError())
  'failsWithMessage'.because(() => { throw new Error() }).failsWithMessage('')

  class A { }
  'isInstanceOf'.because(new A()).isInstanceOf(A)

})

const identity = value => async () => value

'hydre/doubt is async'.doubt(async () => {
  await 'isTrue'.because(Promise.resolve(true)).isTrue()
  await 'isUndefined'.because(Promise.resolve(undefined)).isUndefined()
  await 'isDefined'.because(identity('')).isDefined()
  await 'isFalse'.because(identity(false)).isFalse()

  await 'isEqualTo'.because(identity(1)).isEqualTo(1)
  await 'isEqualTo::1'.because(1).isEqualTo(identity(1))
  await 'isEqualTo::2'.because(identity(1)).isEqualTo(identity(1))

  await 'isNotEqualTo'.because(identity(0)).isNotEqualTo(1)
  await 'isNotEqualTo::1'.because(0).isNotEqualTo(identity(1))
  await 'isNotEqualTo::2'.because(identity(0)).isNotEqualTo(identity(1))

  await 'isDeeplyEqualTo'.because(identity({ a: { a: 1 } })).isDeeplyEqualTo({ a: { a: 1 } })
  await 'isDeeplyEqualTo::1'.because({ a: { a: 1 } }).isDeeplyEqualTo(identity({ a: { a: 1 } }))
  await 'isDeeplyEqualTo::2'.because(identity({ a: { a: 1 } })).isDeeplyEqualTo(identity({ a: { a: 1 } }))

  await 'isAbove'.because(1).isAbove(0)
  await 'isAbove::1'.because(identity(1)).isAbove(0)
  await 'isAbove::2'.because(identity(1)).isAbove(identity(0))

  await 'isBelow'.because(identity(0)).isBelow(1)
  await 'isBelow::1'.because(0).isBelow(identity(1))
  await 'isBelow::2'.because(identity(0)).isBelow(identity(1))

  await 'isBetween'.because(identity(0)).isBetween(0, 1)
  await 'isBetween::1'.because(0).isBetween(identity(0), 1)
  await 'isBetween::2'.because(0).isBetween(0, identity(1))
  await 'isBetween::3'.because(identity(0)).isBetween(identity(0), 1)
  await 'isBetween::4'.because(identity(0)).isBetween(0, identity(1))
  await 'isBetween::5'.because(0).isBetween(identity(0), identity(1))
  await 'isBetween::6'.because(identity(0)).isBetween(identity(0), identity(1))

  await 'isNaN'.because(NaN).isNaN()

  await 'isTypeOf'.because(identity(1)).isTypeOf('number')
  await 'isTypeOf::1'.because(1).isTypeOf(identity('number'))
  await 'isTypeOf::2'.because(identity(1)).isTypeOf(identity('number'))

  await 'hasKeys'.because(identity({ e: NaN, b: 1 })).hasKeys(['e'])
  await 'hasKeys::1'.because({ e: NaN, b: 1 }).hasKeys(identity(['e']))
  await 'hasKeys::2'.because(identity({ e: NaN, b: 1 })).hasKeys(identity(['e']))

  class A { }
  await 'isInstanceOf'.because(identity(new A())).isInstanceOf(A)
  await 'isInstanceOf::1'.because(new A()).isInstanceOf(identity(A))
  await 'isInstanceOf::2'.because(identity(new A())).isInstanceOf(identity(A))

  await 'pass'.because(async () => { await 1..ms() }).pass()
  await 'fails'.because(async () => { throw 'something' }).fails()
  await 'failsWith'.because(async () => { throw new Error() }).failsWith('Error')
  await 'failsWith::1'.because(() => { throw new Error() }).failsWith(async () => 'Error')
  await 'failsWith::2'.because(async () => { throw new Error() }).failsWith(async () => new Error())
  await 'failsWithMessage'.because(async () => { throw new Error('bomboclat') }).failsWithMessage('bomboclat')
  await 'failsWithMessage::1'.because(() => { throw new Error('bomboclat') }).failsWithMessage(async () => 'bomboclat')
  await 'failsWithMessage::2'.because(async () => { throw new Error('bomboclat') }).failsWithMessage(async () => 'bomboclat')
})