import { NextRequest, NextResponse } from 'next/server'

import Stripe from 'stripe'

import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(req: NextRequest) {

  try {

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { invoice_id, amount, description, customer_email } = await req.json()

    if (!invoice_id || !amount || amount <= 0) {

      return NextResponse.json({ error: 'Invalid invoice data' }, { status: 400 })

    }

    const paymentLink = await stripe.paymentLinks.create({

      line_items: [{

        price_data: {

          currency: 'usd',

          product_data: { name: description || 'GigWrench Invoice' },

          unit_amount: Math.round(amount * 100),

        },

        quantity: 1,

      }],

      after_completion: {

        type: 'redirect',

        redirect: { url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://gigwrench-app.vercel.app'}/invoices/${invoice_id}?paid=true` },

      },

      metadata: { invoice_id, pro_id: user.id },

    })

    await supabase.from('invoices').update({

      stripe_payment_link: paymentLink.url,

      status: 'sent',

    }).eq('id', invoice_id).eq('pro_id', user.id)

    return NextResponse.json({ url: paymentLink.url })

  } catch (err: unknown) {

    const message = err instanceof Error ? err.message : 'Unknown error'

    return NextResponse.json({ error: message }, { status: 500 })

  }

}
