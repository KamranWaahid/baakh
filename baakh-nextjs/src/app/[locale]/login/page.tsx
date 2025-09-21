"use client";

import { usePathname, useRouter } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { motion } from "framer-motion";
import Image from "next/image";

export default function LoginPage() {
  const pathname = usePathname();
  const isSindhi = pathname?.startsWith('/sd');
  const router = useRouter();

  return (
    <motion.div
      className="grid min-h-svh lg:grid-cols-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Hide global chrome (Navigation/Footer) on this page */}
      <style dangerouslySetInnerHTML={{ __html: `header, footer { display: none !important; }` }} />
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <motion.div
          className="flex items-center justify-between md:justify-start gap-3"
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <button
            onClick={() => router.back()}
            aria-label={isSindhi ? 'واپس ٿيو' : 'Back'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <Image src="/Baakh.svg" alt="Baakh" width={24} height={24} className="h-6 w-auto" />
        </motion.div>
        <motion.div
          className="flex flex-1 items-center justify-center"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
        >
          <div className="w-full max-w-xs">
            <LoginForm 
              isSindhi={isSindhi}
              className={isSindhi ? 'rtl' : 'ltr'}
            />
          </div>
        </motion.div>
      </div>
      <motion.div
        className="bg-white relative hidden lg:block"
        initial={{ scale: 1.01, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <Image
          src="/placeholder.svg"
          alt={isSindhi ? 'پليس هولڊر' : 'Placeholder'}
          fill
          className="object-cover dark:brightness-[0.2] dark:grayscale select-none pointer-events-none"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
        />
      </motion.div>
    </motion.div>
  );
}


