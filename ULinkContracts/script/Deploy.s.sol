// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import "../src/ProjectRegistry.sol";
import "../src/MembershipNFT.sol";
import "../src/AnalyticsTracker.sol";

/// @title ULink Deployment Script
/// @notice Deploys all ULink contracts to Base Sepolia
contract Deploy is Script {
    // Deployment addresses
    address public deployer;
    address public admin;
    address public treasury;

    // Deployed contract addresses
    ProjectRegistry public projectRegistry;
    MembershipNFT public membershipNFT;
    AnalyticsTracker public analyticsTracker;

    function setUp() public {
        // Load addresses from environment or use defaults
        deployer = vm.envOr("DEPLOYER_ADDRESS", address(0x1));
        admin = vm.envOr("ADMIN_ADDRESS", deployer);
        treasury = vm.envOr("TREASURY_ADDRESS", admin);
        
        console.log("Deployer:", deployer);
        console.log("Admin:", admin);
        console.log("Treasury:", treasury);
    }

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy contracts in dependency order
        deployProjectRegistry();
        deployMembershipNFT();
        deployAnalyticsTracker();

        // Setup contract relationships
        setupContracts();

        vm.stopBroadcast();

        // Log deployment addresses
        logDeployment();
        
        // Save deployment info
        saveDeploymentInfo();
    }

    function deployProjectRegistry() internal {
        console.log("Deploying ProjectRegistry...");
        
        projectRegistry = new ProjectRegistry(admin);
        
        console.log("ProjectRegistry deployed at:", address(projectRegistry));
        
        // Verify deployment
        require(address(projectRegistry) != address(0), "ProjectRegistry deployment failed");
        require(projectRegistry.hasRole(projectRegistry.DEFAULT_ADMIN_ROLE(), admin), "Admin role not set");
    }

    function deployMembershipNFT() internal {
        console.log("Deploying MembershipNFT...");
        
        string memory baseURI = "https://api.ulink.dev/metadata/membership/";
        membershipNFT = new MembershipNFT(admin, treasury, baseURI);
        
        console.log("MembershipNFT deployed at:", address(membershipNFT));
        
        // Verify deployment
        require(address(membershipNFT) != address(0), "MembershipNFT deployment failed");
        require(membershipNFT.hasRole(membershipNFT.DEFAULT_ADMIN_ROLE(), admin), "Admin role not set");
        require(membershipNFT.treasury() == treasury, "Treasury not set correctly");
    }

    function deployAnalyticsTracker() internal {
        console.log("Deploying AnalyticsTracker...");
        
        analyticsTracker = new AnalyticsTracker(admin, address(projectRegistry));
        
        console.log("AnalyticsTracker deployed at:", address(analyticsTracker));
        
        // Verify deployment
        require(address(analyticsTracker) != address(0), "AnalyticsTracker deployment failed");
        require(analyticsTracker.hasRole(analyticsTracker.DEFAULT_ADMIN_ROLE(), admin), "Admin role not set");
        require(address(analyticsTracker.projectRegistry()) == address(projectRegistry), "ProjectRegistry reference not set");
    }

    function setupContracts() internal {
        console.log("Setting up contract relationships...");
        
        // Grant analytics tracker permission to read from project registry
        // (This is already handled by the public interface)
        
        console.log("Contract setup complete");
    }

    function logDeployment() internal view {
        console.log("\n=== ULink Deployment Complete ===");
        console.log("Network: Base Sepolia");
        console.log("Deployer:", deployer);
        console.log("Admin:", admin);
        console.log("Treasury:", treasury);
        console.log("");
        console.log("Contract Addresses:");
        console.log("ProjectRegistry:   ", address(projectRegistry));
        console.log("MembershipNFT:     ", address(membershipNFT));
        console.log("AnalyticsTracker:  ", address(analyticsTracker));
        console.log("");
        console.log("Verification Commands:");
        console.log("forge verify-contract", address(projectRegistry), "src/ProjectRegistry.sol:ProjectRegistry --chain-id 84532");
        console.log("forge verify-contract", address(membershipNFT), "src/MembershipNFT.sol:MembershipNFT --chain-id 84532");
        console.log("forge verify-contract", address(analyticsTracker), "src/AnalyticsTracker.sol:AnalyticsTracker --chain-id 84532");
    }

    function saveDeploymentInfo() internal {
        string memory deploymentInfo = string(abi.encodePacked(
            "# ULink Contract Deployment\n",
            "Network: Base Sepolia (Chain ID: 84532)\n",
            "Deployment Date: ", vm.toString(block.timestamp), "\n",
            "Deployer: ", vm.toString(deployer), "\n",
            "Admin: ", vm.toString(admin), "\n",
            "Treasury: ", vm.toString(treasury), "\n",
            "\n",
            "## Contract Addresses\n",
            "PROJECT_REGISTRY_ADDRESS=", vm.toString(address(projectRegistry)), "\n",
            "MEMBERSHIP_NFT_ADDRESS=", vm.toString(address(membershipNFT)), "\n",
            "ANALYTICS_TRACKER_ADDRESS=", vm.toString(address(analyticsTracker)), "\n",
            "\n",
            "## Environment Variables for .env\n",
            "NEXT_PUBLIC_PROJECT_REGISTRY_CONTRACT=", vm.toString(address(projectRegistry)), "\n",
            "NEXT_PUBLIC_MEMBERSHIP_NFT_CONTRACT=", vm.toString(address(membershipNFT)), "\n",
            "NEXT_PUBLIC_ANALYTICS_TRACKER_CONTRACT=", vm.toString(address(analyticsTracker)), "\n"
        ));

        vm.writeFile("deployment.txt", deploymentInfo);
        console.log("Deployment info saved to deployment.txt");
    }
}