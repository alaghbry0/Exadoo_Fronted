'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar as FlowbiteNavbar } from 'flowbite-react'

const Navbar: React.FC = () => {
  return (
    <FlowbiteNavbar className="bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-1.5">
            <Image
              src="/logo.png"
              alt="Exaado Logo"
              width={48}  // w-12 تعني 48 بكسل
              height={48}
              className="p-1.5"
            />
            <span className="text-xl font-bold text-gray-900">Exaado</span>
          </Link>
        </div>
      </div>
    </FlowbiteNavbar>
  )
}

export default Navbar
