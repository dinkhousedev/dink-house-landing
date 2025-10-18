import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Link } from "@heroui/link";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import Image from "next/image";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/icons";

export const Navbar = () => {
  return (
    <HeroUINavbar
      className="border-b border-divider/10"
      maxWidth="full"
      position="sticky"
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Image
              priority
              alt="The Dink House Logo"
              className="h-12 w-auto object-contain"
              height={60}
              src="/dinklogo.jpg"
              width={150}
            />
          </NextLink>
        </NavbarBrand>
        <div className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-dink-lime data-[active=true]:font-bold font-semibold uppercase text-sm tracking-wider hover:text-dink-lime transition-colors",
                )}
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </div>
    </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <Link isExternal href={siteConfig.links.facebook} title="Facebook">
            <FacebookIcon className="text-default-500 hover:text-dink-lime transition-colors" />
          </Link>
          <Link isExternal href={siteConfig.links.instagram} title="Instagram">
            <InstagramIcon className="text-default-500 hover:text-dink-lime transition-colors" />
          </Link>
          <Link isExternal href={siteConfig.links.tiktok} title="TikTok">
            <TikTokIcon className="text-default-500 hover:text-dink-lime transition-colors" />
          </Link>
          <Link isExternal href={siteConfig.links.youtube} title="YouTube">
            <YouTubeIcon className="text-default-500 hover:text-dink-lime transition-colors" />
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link isExternal href={siteConfig.links.instagram}>
          <InstagramIcon className="text-default-500" />
        </Link>
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.label}-${index}`}>
              <Link
                className="font-semibold uppercase tracking-wider"
                color={index === 0 ? "primary" : "foreground"}
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
