"use client"

import { useEffect, useRef } from "react"
import Typed from "typed.js"

interface TypedTextProps {
  strings: string[]
  typeSpeed?: number
  backSpeed?: number
  backDelay?: number
  loop?: boolean
  showCursor?: boolean
  cursorChar?: string
  className?: string
}

export default function TypedText({
  strings,
  typeSpeed = 70,
  backSpeed = 70,
  backDelay = 3000,
  loop = true,
  showCursor = true,
  cursorChar = "|",
  className = "",
}: TypedTextProps) {
  const el = useRef<HTMLSpanElement>(null)
  const typed = useRef<Typed | null>(null)

  useEffect(() => {
    if (el.current) {
      typed.current = new Typed(el.current, {
        strings,
        typeSpeed,
        backSpeed,
        backDelay,
        loop,
        showCursor,
        cursorChar,
        smartBackspace: true,
      })
    }

    return () => {
      // Make sure to destroy Typed instance on unmounting
      // to prevent memory leaks
      if (typed.current) {
        typed.current.destroy()
      }
    }
  }, [strings, typeSpeed, backSpeed, backDelay, loop, showCursor, cursorChar])

  return <span ref={el} className={className}></span>
}
