import { fas } from "@fortawesome/free-solid-svg-icons";

import NavButton from "@/components/NavButton";

const { faComments, faCameraRetro, faGear, faLocationDot, faUserGroup } = fas;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <nav className="absolute bottom-0 left-0 z-10 flex h-16 w-full items-center justify-around overflow-hidden border-t border-gray-200 bg-gray-100">
        <NavButton
          active={false}
          icon={faLocationDot}
          label=""
          action="/main/chat"
          disabled
          tooltip="Share your location: Disabled for this demo"
        />
        <NavButton active={false} icon={faComments} label="" action="/main/chat" tooltip="Chats" />
        <NavButton active={false} icon={faCameraRetro} label="" action="/main/camera" tooltip="Camera" />
        <NavButton active={false} icon={faUserGroup} label="" action="/main/chat" disabled tooltip="Your Stories" />
        <NavButton
          active={false}
          icon={faGear}
          label=""
          action="/main/settings"
          disabled
          tooltip="Settings: Disabled for this demo"
        />
      </nav>
    </>
  );
}
