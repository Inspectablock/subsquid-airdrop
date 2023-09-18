import {TypeormDatabase} from '@subsquid/typeorm-store'
import {Address} from './model'
import {processor} from './processor'

processor.run(new TypeormDatabase({supportHotBlocks: true}), async (ctx) => {
    for (let c of ctx.blocks) {
        for (let tx of c.transactions) {
            await ctx.store.upsert(new Address({
                id: tx.from
            }))
        }
    }
})
