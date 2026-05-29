import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 使用默认输出模式（服务器端渲染）
  // output: "standalone",
  // 禁用静态生成超时限制
  // staticPageGenerationTimeout: 0,
  // 中文路径问题修复
  trailingSlash: true,
};

export default nextConfig;
