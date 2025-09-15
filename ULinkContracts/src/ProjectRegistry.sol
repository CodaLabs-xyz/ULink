// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IProjectRegistry.sol";

/// @title ULink Project Registry
/// @notice Main registry for ULink projects on Base blockchain
/// @dev Stores project metadata hashes and ownership information
contract ProjectRegistry is IProjectRegistry, AccessControl, ReentrancyGuard, Pausable {
    /// @notice Role for project management
    bytes32 public constant PROJECT_MANAGER_ROLE = keccak256("PROJECT_MANAGER_ROLE");
    
    /// @notice Role for emergency operations
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    /// @notice Maximum membership tier
    uint256 public constant MAX_MEMBERSHIP_TIER = 2;

    /// @notice Maximum projects per free tier user
    uint256 public constant FREE_TIER_PROJECT_LIMIT = 3;

    /// @notice Maximum projects per pro tier user
    uint256 public constant PRO_TIER_PROJECT_LIMIT = 25;

    /// @notice Maximum projects per premium tier user (unlimited)
    uint256 public constant PREMIUM_TIER_PROJECT_LIMIT = type(uint256).max;

    /// @notice Mapping from project ID to project information
    mapping(string => ProjectInfo) private _projects;

    /// @notice Mapping from slug to project ID
    mapping(string => string) private _slugToProjectId;

    /// @notice Mapping from owner to list of project IDs
    mapping(address => string[]) private _ownerProjects;

    /// @notice Mapping from owner to project count by tier
    mapping(address => mapping(uint256 => uint256)) private _ownerProjectCountByTier;

    /// @notice Total number of projects
    uint256 public totalProjects;

    /// @notice Contract version
    string public constant VERSION = "1.0.0";

    modifier onlyProjectOwner(string calldata projectId) {
        if (!isProjectOwner(projectId, msg.sender)) {
            revert UnauthorizedAccess();
        }
        _;
    }

    modifier validMembershipTier(uint256 tier) {
        if (tier > MAX_MEMBERSHIP_TIER) {
            revert InvalidMembershipTier();
        }
        _;
    }

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PROJECT_MANAGER_ROLE, admin);
        _grantRole(EMERGENCY_ROLE, admin);
    }

    /// @inheritdoc IProjectRegistry
    function createProject(
        string calldata projectId,
        string calldata title,
        string calldata slug,
        string calldata metadataHash,
        uint256 membershipTier
    ) external nonReentrant whenNotPaused validMembershipTier(membershipTier) {
        // Check if project already exists
        if (bytes(_projects[projectId].projectId).length != 0) {
            revert ProjectAlreadyExists();
        }

        // Check if slug is available
        if (!isSlugAvailable(slug)) {
            revert SlugAlreadyTaken();
        }

        // Check project limits based on membership tier
        _checkProjectLimits(msg.sender, membershipTier);

        // Create project
        ProjectInfo memory newProject = ProjectInfo({
            projectId: projectId,
            title: title,
            slug: slug,
            owner: msg.sender,
            metadataHash: metadataHash,
            createdAt: block.timestamp,
            isActive: true,
            membershipTier: membershipTier
        });

        // Store project
        _projects[projectId] = newProject;
        _slugToProjectId[slug] = projectId;
        _ownerProjects[msg.sender].push(projectId);
        _ownerProjectCountByTier[msg.sender][membershipTier]++;
        totalProjects++;

        emit ProjectCreated(projectId, msg.sender, slug, metadataHash, membershipTier);
    }

    /// @inheritdoc IProjectRegistry
    function updateProject(
        string calldata projectId,
        string calldata metadataHash
    ) external onlyProjectOwner(projectId) whenNotPaused {
        ProjectInfo storage project = _projects[projectId];
        
        if (!project.isActive) {
            revert ProjectInactive();
        }

        project.metadataHash = metadataHash;

        emit ProjectUpdated(projectId, metadataHash, block.timestamp);
    }

    /// @inheritdoc IProjectRegistry
    function updateSlug(
        string calldata projectId,
        string calldata newSlug
    ) external onlyProjectOwner(projectId) whenNotPaused {
        ProjectInfo storage project = _projects[projectId];
        
        if (!project.isActive) {
            revert ProjectInactive();
        }

        if (!isSlugAvailable(newSlug)) {
            revert SlugAlreadyTaken();
        }

        string memory oldSlug = project.slug;
        
        // Update mappings
        delete _slugToProjectId[oldSlug];
        _slugToProjectId[newSlug] = projectId;
        project.slug = newSlug;

        emit SlugUpdated(projectId, oldSlug, newSlug);
    }

    /// @inheritdoc IProjectRegistry
    function deactivateProject(string calldata projectId) 
        external 
        onlyProjectOwner(projectId) 
        whenNotPaused 
    {
        ProjectInfo storage project = _projects[projectId];
        
        if (!project.isActive) {
            revert ProjectInactive();
        }

        project.isActive = false;
        _ownerProjectCountByTier[project.owner][project.membershipTier]--;

        // Remove slug mapping
        delete _slugToProjectId[project.slug];

        emit ProjectDeactivated(projectId, project.owner, block.timestamp);
    }

    /// @inheritdoc IProjectRegistry
    function updateMembershipTier(
        string calldata projectId,
        uint256 newTier
    ) external onlyProjectOwner(projectId) whenNotPaused validMembershipTier(newTier) {
        ProjectInfo storage project = _projects[projectId];
        
        if (!project.isActive) {
            revert ProjectInactive();
        }

        uint256 oldTier = project.membershipTier;
        
        // Update tier counts
        _ownerProjectCountByTier[project.owner][oldTier]--;
        _ownerProjectCountByTier[project.owner][newTier]++;
        
        project.membershipTier = newTier;

        emit MembershipTierUpdated(projectId, oldTier, newTier);
    }

    /// @inheritdoc IProjectRegistry
    function getProject(string calldata projectId)
        external
        view
        returns (ProjectInfo memory)
    {
        ProjectInfo memory project = _projects[projectId];
        if (bytes(project.projectId).length == 0) {
            revert ProjectNotFound();
        }
        return project;
    }

    /// @inheritdoc IProjectRegistry
    function getProjectBySlug(string calldata slug)
        external
        view
        returns (ProjectInfo memory)
    {
        string memory projectId = _slugToProjectId[slug];
        if (bytes(projectId).length == 0) {
            revert ProjectNotFound();
        }
        return _projects[projectId];
    }

    /// @inheritdoc IProjectRegistry
    function isSlugAvailable(string calldata slug)
        public
        view
        returns (bool)
    {
        return bytes(_slugToProjectId[slug]).length == 0;
    }

    /// @inheritdoc IProjectRegistry
    function getProjectsByOwner(
        address owner,
        uint256 offset,
        uint256 limit
    ) external view returns (ProjectInfo[] memory projects) {
        string[] memory ownerProjectIds = _ownerProjects[owner];
        uint256 totalOwnerProjects = ownerProjectIds.length;
        
        if (offset >= totalOwnerProjects) {
            return new ProjectInfo[](0);
        }
        
        uint256 end = offset + limit;
        if (end > totalOwnerProjects) {
            end = totalOwnerProjects;
        }
        
        uint256 resultLength = end - offset;
        projects = new ProjectInfo[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            string memory projectId = ownerProjectIds[offset + i];
            projects[i] = _projects[projectId];
        }
    }

    /// @inheritdoc IProjectRegistry
    function getOwnerProjectCount(address owner)
        external
        view
        returns (uint256)
    {
        return _ownerProjects[owner].length;
    }

    /// @inheritdoc IProjectRegistry
    function isProjectOwner(string calldata projectId, address owner)
        public
        view
        returns (bool)
    {
        return _projects[projectId].owner == owner;
    }

    /// @notice Get project count by tier for an owner
    /// @param owner Owner address
    /// @param tier Membership tier
    /// @return Project count for the tier
    function getOwnerProjectCountByTier(address owner, uint256 tier)
        external
        view
        returns (uint256)
    {
        return _ownerProjectCountByTier[owner][tier];
    }

    /// @notice Emergency function to pause the contract
    function pause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }

    /// @notice Emergency function to unpause the contract
    function unpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
    }

    /// @notice Admin function to force deactivate a project
    /// @param projectId Project to deactivate
    function adminDeactivateProject(string calldata projectId)
        external
        onlyRole(PROJECT_MANAGER_ROLE)
    {
        ProjectInfo storage project = _projects[projectId];
        
        if (bytes(project.projectId).length == 0) {
            revert ProjectNotFound();
        }

        if (project.isActive) {
            project.isActive = false;
            _ownerProjectCountByTier[project.owner][project.membershipTier]--;
            delete _slugToProjectId[project.slug];
            
            emit ProjectDeactivated(projectId, project.owner, block.timestamp);
        }
    }

    /// @notice Check project limits based on membership tier
    /// @param owner Project owner
    /// @param tier Membership tier
    function _checkProjectLimits(address owner, uint256 tier) internal view {
        uint256 currentCount = _ownerProjectCountByTier[owner][tier];
        uint256 limit;

        if (tier == 0) {
            limit = FREE_TIER_PROJECT_LIMIT;
        } else if (tier == 1) {
            limit = PRO_TIER_PROJECT_LIMIT;
        } else {
            limit = PREMIUM_TIER_PROJECT_LIMIT;
        }

        require(currentCount < limit, "Project limit exceeded for tier");
    }
}