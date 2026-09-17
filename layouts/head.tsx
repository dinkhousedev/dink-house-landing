import React from "react";
import NextHead from "next/head";

import { siteConfig } from "@/config/site";
import { CLOUDFRONT_URL } from "@/config/media-urls";

export const Head = () => {
  return (
    <NextHead>
      <title>{siteConfig.name} - Coming Soon 2025</title>
      <meta
        key="title"
        content={`${siteConfig.name} - Coming Soon 2025`}
        property="og:title"
      />
      <meta content={siteConfig.description} property="og:description" />
      <meta content={siteConfig.description} name="description" />
      <meta
        key="viewport"
        content="viewport-fit=cover, width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        name="viewport"
      />
      <link href="/favicon.ico" rel="icon" />
      <link href={CLOUDFRONT_URL} rel="preconnect" />
      <link href={CLOUDFRONT_URL} rel="dns-prefetch" />
    </NextHead>
  );
};
