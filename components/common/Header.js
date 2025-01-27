import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="header-bar">
      <div className="header-left">
        <h1 className="header-title">
          <Image 
            src="/xai_white.png" 
            alt="XAI Logo" 
            width={24} 
            height={24} 
          />
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            <span>GrokDoc</span>
          </Link>
        </h1>
      </div>
    </header>
  );
}