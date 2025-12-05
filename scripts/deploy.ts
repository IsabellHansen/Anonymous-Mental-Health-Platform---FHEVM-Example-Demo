#!/usr/bin/env ts-node

/**
 * Deployment Script for Anonymous Mental Health Platform
 *
 * This script demonstrates how to deploy FHEVM contracts with proper
 * configuration and verification.
 *
 * @chapter: deployment
 * @category: setup
 */

import { ethers } from "hardhat";

async function main() {
  console.log("\n🚀 Deploying Anonymous Mental Health Platform...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy contract
  console.log("⏳ Deploying contract...");
  const AnonymousMentalHealth = await ethers.getContractFactory(
    "AnonymousMentalHealth"
  );
  const contract = await AnonymousMentalHealth.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ Contract deployed to:", contractAddress);
  console.log("👨‍⚕️ Counselor address:", deployer.address);

  // Display deployment information
  console.log("\n📋 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Deployer:", deployer.address);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Save deployment information
  const deploymentInfo = {
    contractAddress,
    network: (await ethers.provider.getNetwork()).name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("💾 Deployment Info:", JSON.stringify(deploymentInfo, null, 2));

  console.log("\n✨ Deployment complete!");
  console.log("\n📝 Next steps:");
  console.log("  1. Update frontend configuration with contract address");
  console.log("  2. Verify contract on block explorer");
  console.log("  3. Test contract functionality\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
