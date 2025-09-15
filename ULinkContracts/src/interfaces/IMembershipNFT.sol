// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/interfaces/IERC721.sol";

interface IMembershipNFT is IERC721 {
    /// @notice Membership tier enumeration
    enum MembershipTier {
        FREE,    // 0 - Free tier (no NFT required)
        PRO,     // 1 - Pro tier NFT
        PREMIUM  // 2 - Premium tier NFT
    }

    /// @notice Membership information structure
    struct MembershipInfo {
        MembershipTier tier;
        uint256 expiresAt;
        uint256 mintedAt;
        bool isActive;
        uint256 renewalCount;
    }

    /// @notice Events
    event MembershipMinted(
        address indexed to,
        uint256 indexed tokenId,
        MembershipTier tier,
        uint256 duration
    );

    event MembershipRenewed(
        uint256 indexed tokenId,
        uint256 newExpirationTime,
        uint256 renewalCount
    );

    event MembershipUpgraded(
        uint256 indexed tokenId,
        MembershipTier oldTier,
        MembershipTier newTier
    );

    event MembershipExpired(
        uint256 indexed tokenId,
        address indexed owner
    );

    /// @notice Errors
    error InvalidMembershipTier();
    error MembershipExpired();
    error InsufficientPayment();
    error MembershipNotFound();
    error UnauthorizedAccess();

    /// @notice Mint a new membership NFT
    /// @param to Address to mint to
    /// @param tier Membership tier
    /// @param duration Duration in seconds
    function mintMembership(
        address to,
        MembershipTier tier,
        uint256 duration
    ) external payable returns (uint256 tokenId);

    /// @notice Renew an existing membership
    /// @param tokenId Token ID to renew
    /// @param additionalDuration Additional duration in seconds
    function renewMembership(uint256 tokenId, uint256 additionalDuration)
        external
        payable;

    /// @notice Upgrade membership tier
    /// @param tokenId Token ID to upgrade
    /// @param newTier New membership tier
    function upgradeMembership(uint256 tokenId, MembershipTier newTier)
        external
        payable;

    /// @notice Get membership information
    /// @param tokenId Token ID
    /// @return Membership information
    function getMembershipInfo(uint256 tokenId)
        external
        view
        returns (MembershipInfo memory);

    /// @notice Get user's active membership tier
    /// @param user User address
    /// @return Active membership tier
    function getUserMembershipTier(address user)
        external
        view
        returns (MembershipTier);

    /// @notice Check if user has active membership
    /// @param user User address
    /// @param requiredTier Minimum required tier
    /// @return True if user has active membership of required tier or higher
    function hasActiveMembership(address user, MembershipTier requiredTier)
        external
        view
        returns (bool);

    /// @notice Get membership price for tier and duration
    /// @param tier Membership tier
    /// @param duration Duration in seconds
    /// @return Price in wei
    function getMembershipPrice(MembershipTier tier, uint256 duration)
        external
        view
        returns (uint256);

    /// @notice Get user's membership token ID
    /// @param user User address
    /// @return Token ID (0 if no membership)
    function getUserTokenId(address user) external view returns (uint256);

    /// @notice Check if membership is expired
    /// @param tokenId Token ID
    /// @return True if expired
    function isMembershipExpired(uint256 tokenId)
        external
        view
        returns (bool);
}