import React, { memo } from "react"

interface LogoProps {
  size: number
}

const Logo = memo(function Logo({ size }: LogoProps) {
  return (
    <div className="flex p-1 aspect-square items-center justify-center rounded-md bg-gradient text-sidebar-primary-foreground">
      <svg
        fill="currentColor"
        height={size}
        width={size}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 96 96"
        x="0px"
        y="0px"
      >
        <g>
          <path d="M72.6,50a30.0328,30.0328,0,0,0-30-30,30.0484,30.0484,0,0,0-30,30v6l20-3.5586v8.3242L16.6,68V81.5274l-3.7891,7.5781A2.0009,2.0009,0,0,0,14.6,92c28.8809,0,34.0079-10.3672,37.0723-16.5626C53.0257,72.6953,53.4906,72,54.6,72c2.3554,0,3.834,2.2188,6.0488,5.836C63.4222,82.3633,66.8734,88,74.6,88a2.0009,2.0009,0,0,0,1.7891-2.8946C72.6,77.5274,72.6,58.9336,72.6,50Z" />
          <path d="M42.6,4A42.0176,42.0176,0,0,0,11.5179,17.7773a2.0017,2.0017,0,0,0,.2324,2.9063l6.7478,5.3977A33.6032,33.6032,0,0,1,42.6,16,34.0148,34.0148,0,0,1,76.4987,48H82.6a1.9988,1.9988,0,0,0,2-2A42.0472,42.0472,0,0,0,42.6,4Z" />
        </g>
      </svg>
    </div>
  );
});

export default Logo;
