// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./interfaces/IMembershipNFT.sol";

/// @title ULink Membership NFT
/// @notice NFT-based membership system for ULink platform
/// @dev Manages Pro and Premium tier memberships with expiration
contract MembershipNFT is 
    IMembershipNFT, 
    ERC721URIStorage, 
    AccessControl, 
    ReentrancyGuard, 
    Pausable 
{
    /// @notice Role for membership management
    bytes32 public constant MEMBERSHIP_MANAGER_ROLE = keccak256("MEMBERSHIP_MANAGER_ROLE");
    
    /// @notice Role for price management
    bytes32 public constant PRICE_MANAGER_ROLE = keccak256("PRICE_MANAGER_ROLE");

    /// @notice Role for emergency operations
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    /// @notice Mapping from token ID to membership information
    mapping(uint256 => MembershipInfo) private _memberships;

    /// @notice Mapping from user address to token ID
    mapping(address => uint256) private _userTokens;

    /// @notice Token ID counter
    uint256 private _tokenIdCounter = 1;

    /// @notice Membership pricing (tier => duration => price)
    mapping(MembershipTier => mapping(uint256 => uint256)) public membershipPrices;

    /// @notice Treasury address for payments
    address public treasury;

    /// @notice Base URI for metadata
    string private _baseTokenURI;

    /// @notice Contract version
    string public constant VERSION = "1.0.0";

    /// @notice Standard durations (30 days, 90 days, 365 days)
    uint256 public constant DURATION_30_DAYS = 30 days;
    uint256 public constant DURATION_90_DAYS = 90 days;
    uint256 public constant DURATION_365_DAYS = 365 days;

    modifier onlyTokenOwner(uint256 tokenId) {
        if (ownerOf(tokenId) != msg.sender) {
            revert UnauthorizedAccess();
        }
        _;
    }

    modifier validTier(MembershipTier tier) {
        if (tier == MembershipTier.FREE) {
            revert InvalidMembershipTier();
        }
        _;
    }

    constructor(
        address admin,
        address _treasury,
        string memory baseURI
    ) ERC721("ULink Membership", "ULINK") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MEMBERSHIP_MANAGER_ROLE, admin);
        _grantRole(PRICE_MANAGER_ROLE, admin);
        _grantRole(EMERGENCY_ROLE, admin);
        
        treasury = _treasury;
        _baseTokenURI = baseURI;

        _initializePricing();
    }

    /// @inheritdoc IMembershipNFT
    function mintMembership(
        address to,
        MembershipTier tier,
        uint256 duration
    ) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        validTier(tier)
        returns (uint256 tokenId) 
    {
        // Check if user already has a membership
        uint256 existingTokenId = _userTokens[to];
        if (existingTokenId != 0 && !isMembershipExpired(existingTokenId)) {
            revert("User already has active membership");
        }

        // Validate payment
        uint256 requiredPrice = getMembershipPrice(tier, duration);
        if (msg.value < requiredPrice) {
            revert InsufficientPayment();
        }

        tokenId = _tokenIdCounter++;
        
        // Create membership info
        _memberships[tokenId] = MembershipInfo({
            tier: tier,
            expiresAt: block.timestamp + duration,
            mintedAt: block.timestamp,
            isActive: true,
            renewalCount: 0
        });

        // Update user mapping
        _userTokens[to] = tokenId;

        // Mint NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _generateTokenURI(tier));

        // Transfer payment to treasury
        if (msg.value > 0) {
            (bool success, ) = treasury.call{value: msg.value}("");
            require(success, "Payment transfer failed");
        }

        emit MembershipMinted(to, tokenId, tier, duration);
    }

    /// @inheritdoc IMembershipNFT
    function renewMembership(uint256 tokenId, uint256 additionalDuration)
        external
        payable
        nonReentrant
        whenNotPaused
        onlyTokenOwner(tokenId)
    {
        MembershipInfo storage membership = _memberships[tokenId];
        
        if (membership.tier == MembershipTier.FREE) {
            revert MembershipNotFound();
        }

        // Validate payment
        uint256 requiredPrice = getMembershipPrice(membership.tier, additionalDuration);
        if (msg.value < requiredPrice) {
            revert InsufficientPayment();
        }

        // Extend expiration (from current expiration or now, whichever is later)
        uint256 baseTime = membership.expiresAt > block.timestamp 
            ? membership.expiresAt 
            : block.timestamp;
        
        membership.expiresAt = baseTime + additionalDuration;
        membership.renewalCount++;
        membership.isActive = true;

        // Transfer payment to treasury
        if (msg.value > 0) {
            (bool success, ) = treasury.call{value: msg.value}("");
            require(success, "Payment transfer failed");
        }

        emit MembershipRenewed(tokenId, membership.expiresAt, membership.renewalCount);
    }

    /// @inheritdoc IMembershipNFT
    function upgradeMembership(uint256 tokenId, MembershipTier newTier)
        external
        payable
        nonReentrant
        whenNotPaused
        onlyTokenOwner(tokenId)
        validTier(newTier)
    {
        MembershipInfo storage membership = _memberships[tokenId];
        
        if (membership.tier == MembershipTier.FREE) {
            revert MembershipNotFound();
        }

        if (newTier <= membership.tier) {
            revert("Cannot downgrade membership");
        }

        MembershipTier oldTier = membership.tier;
        
        // Calculate upgrade cost (difference between tiers for remaining duration)
        uint256 remainingDuration = membership.expiresAt > block.timestamp 
            ? membership.expiresAt - block.timestamp 
            : 0;
        
        if (remainingDuration == 0) {
            revert MembershipExpired();
        }

        uint256 upgradeCost = _calculateUpgradeCost(oldTier, newTier, remainingDuration);
        
        if (msg.value < upgradeCost) {
            revert InsufficientPayment();
        }

        // Update membership
        membership.tier = newTier;
        _setTokenURI(tokenId, _generateTokenURI(newTier));

        // Transfer payment to treasury
        if (msg.value > 0) {
            (bool success, ) = treasury.call{value: msg.value}("");
            require(success, "Payment transfer failed");
        }

        emit MembershipUpgraded(tokenId, oldTier, newTier);
    }

    /// @inheritdoc IMembershipNFT
    function getMembershipInfo(uint256 tokenId)
        external
        view
        returns (MembershipInfo memory)
    {
        if (!_exists(tokenId)) {
            revert MembershipNotFound();
        }
        return _memberships[tokenId];
    }

    /// @inheritdoc IMembershipNFT
    function getUserMembershipTier(address user)
        external
        view
        returns (MembershipTier)
    {
        uint256 tokenId = _userTokens[user];
        if (tokenId == 0) {
            return MembershipTier.FREE;
        }

        if (isMembershipExpired(tokenId)) {
            return MembershipTier.FREE;
        }

        return _memberships[tokenId].tier;
    }

    /// @inheritdoc IMembershipNFT
    function hasActiveMembership(address user, MembershipTier requiredTier)
        external
        view
        returns (bool)
    {
        uint256 tokenId = _userTokens[user];
        if (tokenId == 0) {
            return requiredTier == MembershipTier.FREE;
        }

        if (isMembershipExpired(tokenId)) {
            return requiredTier == MembershipTier.FREE;
        }

        return _memberships[tokenId].tier >= requiredTier;
    }

    /// @inheritdoc IMembershipNFT
    function getMembershipPrice(MembershipTier tier, uint256 duration)
        public
        view
        returns (uint256)
    {
        if (tier == MembershipTier.FREE) {
            return 0;
        }

        // Check for exact duration match first
        uint256 exactPrice = membershipPrices[tier][duration];
        if (exactPrice > 0) {
            return exactPrice;
        }

        // Calculate price based on daily rate for custom durations
        uint256 dailyRate = membershipPrices[tier][DURATION_30_DAYS] / 30;
        uint256 durationInDays = duration / 1 days;
        
        return dailyRate * durationInDays;
    }

    /// @inheritdoc IMembershipNFT
    function getUserTokenId(address user) external view returns (uint256) {
        return _userTokens[user];
    }

    /// @inheritdoc IMembershipNFT
    function isMembershipExpired(uint256 tokenId) public view returns (bool) {
        if (!_exists(tokenId)) {
            return true;
        }
        return block.timestamp >= _memberships[tokenId].expiresAt;
    }

    /// @notice Set membership price for a tier and duration
    /// @param tier Membership tier
    /// @param duration Duration in seconds
    /// @param price Price in wei
    function setMembershipPrice(
        MembershipTier tier,
        uint256 duration,
        uint256 price
    ) external onlyRole(PRICE_MANAGER_ROLE) {
        membershipPrices[tier][duration] = price;
    }

    /// @notice Set treasury address
    /// @param newTreasury New treasury address
    function setTreasury(address newTreasury) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        treasury = newTreasury;
    }

    /// @notice Set base token URI
    /// @param newBaseURI New base URI
    function setBaseURI(string calldata newBaseURI)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _baseTokenURI = newBaseURI;
    }

    /// @notice Emergency pause
    function pause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }

    /// @notice Emergency unpause
    function unpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
    }

    /// @notice Admin function to expire a membership
    /// @param tokenId Token ID to expire
    function adminExpireMembership(uint256 tokenId)
        external
        onlyRole(MEMBERSHIP_MANAGER_ROLE)
    {
        if (!_exists(tokenId)) {
            revert MembershipNotFound();
        }

        MembershipInfo storage membership = _memberships[tokenId];
        membership.expiresAt = block.timestamp;
        membership.isActive = false;

        emit MembershipExpired(tokenId, ownerOf(tokenId));
    }

    /// @notice Override transfer to update user mapping
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._afterTokenTransfer(from, to, tokenId, batchSize);
        
        if (from != address(0)) {
            delete _userTokens[from];
        }
        if (to != address(0)) {
            _userTokens[to] = tokenId;
        }
    }

    /// @notice Generate token URI based on tier
    function _generateTokenURI(MembershipTier tier) 
        internal 
        view 
        returns (string memory) 
    {
        if (tier == MembershipTier.PRO) {
            return string(abi.encodePacked(_baseTokenURI, "pro.json"));
        } else if (tier == MembershipTier.PREMIUM) {
            return string(abi.encodePacked(_baseTokenURI, "premium.json"));
        }
        return "";
    }

    /// @notice Calculate upgrade cost between tiers
    function _calculateUpgradeCost(
        MembershipTier fromTier,
        MembershipTier toTier,
        uint256 remainingDuration
    ) internal view returns (uint256) {
        uint256 fromPrice = getMembershipPrice(fromTier, remainingDuration);
        uint256 toPrice = getMembershipPrice(toTier, remainingDuration);
        
        return toPrice > fromPrice ? toPrice - fromPrice : 0;
    }

    /// @notice Initialize default pricing
    function _initializePricing() internal {
        // Pro tier pricing (in wei)
        membershipPrices[MembershipTier.PRO][DURATION_30_DAYS] = 0.01 ether;   // ~$20
        membershipPrices[MembershipTier.PRO][DURATION_90_DAYS] = 0.025 ether;  // ~$50 (17% discount)
        membershipPrices[MembershipTier.PRO][DURATION_365_DAYS] = 0.08 ether;  // ~$160 (33% discount)

        // Premium tier pricing (in wei)
        membershipPrices[MembershipTier.PREMIUM][DURATION_30_DAYS] = 0.025 ether;  // ~$50
        membershipPrices[MembershipTier.PREMIUM][DURATION_90_DAYS] = 0.065 ether;  // ~$130 (17% discount)
        membershipPrices[MembershipTier.PREMIUM][DURATION_365_DAYS] = 0.2 ether;   // ~$400 (33% discount)
    }

    /// @notice Override supportsInterface to include all interfaces
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl, IERC165)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}