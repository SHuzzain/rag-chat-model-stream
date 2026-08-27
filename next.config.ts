import type { NextConfig } from "next";

import { withWorkflow } from "workflow/next";

const nextConfig: NextConfig = {
  logging: {
    browserToTerminal: true,
  },
  cacheComponents: true,
};

export default withWorkflow(nextConfig);
