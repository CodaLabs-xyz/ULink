// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

interface IProjectRegistry {
    /// @notice Project information structure
    struct ProjectInfo {
        string projectId;
        string title;
        string slug;
        address owner;
        string metadataHash;
        uint256 createdAt;
        bool isActive;
        uint256 membershipTier; // 0: Free, 1: Pro, 2: Premium
    }

    /// @notice Events
    event ProjectCreated(
        string indexed projectId,
        address indexed owner,
        string slug,
        string metadataHash,
        uint256 membershipTier
    );

    event ProjectUpdated(
        string indexed projectId,
        string metadataHash,
        uint256 timestamp
    );

    event ProjectDeactivated(
        string indexed projectId,
        address indexed owner,
        uint256 timestamp
    );

    event SlugUpdated(
        string indexed projectId,
        string oldSlug,
        string newSlug
    );

    event MembershipTierUpdated(
        string indexed projectId,
        uint256 oldTier,
        uint256 newTier
    );

    /// @notice Errors
    error ProjectAlreadyExists();
    error ProjectNotFound();
    error SlugAlreadyTaken();
    error UnauthorizedAccess();
    error InvalidMembershipTier();
    error ProjectInactive();

    /// @notice Create a new project
    /// @param projectId Unique project identifier
    /// @param title Project title
    /// @param slug Unique URL slug
    /// @param metadataHash IPFS or Firebase reference hash
    /// @param membershipTier Membership tier (0-2)
    function createProject(
        string calldata projectId,
        string calldata title,
        string calldata slug,
        string calldata metadataHash,
        uint256 membershipTier
    ) external;

    /// @notice Update project metadata
    /// @param projectId Project identifier
    /// @param metadataHash New metadata hash
    function updateProject(
        string calldata projectId,
        string calldata metadataHash
    ) external;

    /// @notice Update project slug
    /// @param projectId Project identifier
    /// @param newSlug New unique slug
    function updateSlug(
        string calldata projectId,
        string calldata newSlug
    ) external;

    /// @notice Deactivate a project
    /// @param projectId Project identifier
    function deactivateProject(string calldata projectId) external;

    /// @notice Update membership tier
    /// @param projectId Project identifier
    /// @param newTier New membership tier
    function updateMembershipTier(
        string calldata projectId,
        uint256 newTier
    ) external;

    /// @notice Get project information
    /// @param projectId Project identifier
    /// @return Project information
    function getProject(string calldata projectId)
        external
        view
        returns (ProjectInfo memory);

    /// @notice Get project by slug
    /// @param slug Project slug
    /// @return Project information
    function getProjectBySlug(string calldata slug)
        external
        view
        returns (ProjectInfo memory);

    /// @notice Check if slug is available
    /// @param slug Slug to check
    /// @return True if available
    function isSlugAvailable(string calldata slug)
        external
        view
        returns (bool);

    /// @notice Get projects by owner
    /// @param owner Owner address
    /// @param offset Pagination offset
    /// @param limit Maximum results
    /// @return projects Array of project information
    function getProjectsByOwner(
        address owner,
        uint256 offset,
        uint256 limit
    ) external view returns (ProjectInfo[] memory projects);

    /// @notice Get total project count for owner
    /// @param owner Owner address
    /// @return Total project count
    function getOwnerProjectCount(address owner)
        external
        view
        returns (uint256);

    /// @notice Check project ownership
    /// @param projectId Project identifier
    /// @param owner Address to check
    /// @return True if owner
    function isProjectOwner(string calldata projectId, address owner)
        external
        view
        returns (bool);
}