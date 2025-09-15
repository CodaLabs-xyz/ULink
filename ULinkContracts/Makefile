# ULink Smart Contracts Makefile

# Load environment variables
include .env
export

# Default target
.PHONY: help
help:
	@echo "ULink Smart Contracts"
	@echo ""
	@echo "Available commands:"
	@echo "  setup          - Install dependencies and initialize project"
	@echo "  build          - Compile all contracts"
	@echo "  test           - Run all tests"
	@echo "  test-verbose   - Run tests with verbose output"
	@echo "  coverage       - Generate test coverage report"
	@echo "  deploy-sepolia - Deploy to Base Sepolia testnet"
	@echo "  deploy-mainnet - Deploy to Base mainnet"
	@echo "  verify         - Verify contracts on Basescan"
	@echo "  clean          - Clean build artifacts"
	@echo "  lint           - Run linting"
	@echo "  format         - Format code"

# Setup and dependencies
.PHONY: setup
setup:
	@echo "Setting up ULink contracts..."
	forge install OpenZeppelin/openzeppelin-contracts
	forge install OpenZeppelin/openzeppelin-contracts-upgradeable
	forge install foundry-rs/forge-std
	@echo "Setup complete!"

# Build
.PHONY: build
build:
	@echo "Compiling contracts..."
	forge build

# Testing
.PHONY: test
test:
	@echo "Running tests..."
	forge test

.PHONY: test-verbose
test-verbose:
	@echo "Running tests with verbose output..."
	forge test -vvv

.PHONY: coverage
coverage:
	@echo "Generating coverage report..."
	forge coverage

# Deployment
.PHONY: deploy-sepolia
deploy-sepolia:
	@echo "Deploying to Base Sepolia..."
	@if [ -z "$(DEPLOYER_PRIVATE_KEY)" ]; then \
		echo "Error: DEPLOYER_PRIVATE_KEY not set"; \
		exit 1; \
	fi
	forge script script/Deploy.s.sol:Deploy --rpc-url $(BASE_SEPOLIA_RPC_URL) --broadcast --verify

.PHONY: deploy-mainnet
deploy-mainnet:
	@echo "Deploying to Base Mainnet..."
	@echo "WARNING: This will deploy to MAINNET. Are you sure? (y/N)"
	@read confirm && [ "$$confirm" = "y" ]
	@if [ -z "$(DEPLOYER_PRIVATE_KEY)" ]; then \
		echo "Error: DEPLOYER_PRIVATE_KEY not set"; \
		exit 1; \
	fi
	forge script script/Deploy.s.sol:Deploy --rpc-url $(BASE_MAINNET_RPC_URL) --broadcast --verify

# Verification
.PHONY: verify
verify:
	@echo "Verifying contracts..."
	@if [ -z "$(PROJECT_REGISTRY_ADDRESS)" ]; then \
		echo "Error: PROJECT_REGISTRY_ADDRESS not set"; \
		exit 1; \
	fi
	forge verify-contract $(PROJECT_REGISTRY_ADDRESS) src/ProjectRegistry.sol:ProjectRegistry --chain-id 84532
	forge verify-contract $(MEMBERSHIP_NFT_ADDRESS) src/MembershipNFT.sol:MembershipNFT --chain-id 84532
	forge verify-contract $(ANALYTICS_TRACKER_ADDRESS) src/AnalyticsTracker.sol:AnalyticsTracker --chain-id 84532

# Utility
.PHONY: clean
clean:
	@echo "Cleaning build artifacts..."
	forge clean

.PHONY: lint
lint:
	@echo "Running linting..."
	forge fmt --check

.PHONY: format
format:
	@echo "Formatting code..."
	forge fmt

# Local development
.PHONY: anvil
anvil:
	@echo "Starting local Anvil node..."
	anvil --chain-id 31337

.PHONY: deploy-local
deploy-local:
	@echo "Deploying to local Anvil..."
	forge script script/Deploy.s.sol:Deploy --rpc-url http://localhost:8545 --broadcast

# Gas reporting
.PHONY: gas-report
gas-report:
	@echo "Generating gas report..."
	forge test --gas-report

# Security
.PHONY: slither
slither:
	@echo "Running Slither security analysis..."
	slither .

# Documentation
.PHONY: docs
docs:
	@echo "Generating documentation..."
	forge doc

# Quick commands
.PHONY: quick-test
quick-test: build test

.PHONY: quick-deploy
quick-deploy: build deploy-sepolia