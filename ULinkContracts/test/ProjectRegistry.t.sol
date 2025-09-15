// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Test.sol";
import "../src/ProjectRegistry.sol";

contract ProjectRegistryTest is Test {
    ProjectRegistry public registry;
    
    address public admin = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    
    string constant PROJECT_ID = "test-project-123";
    string constant TITLE = "Test Project";
    string constant SLUG = "test-project";
    string constant METADATA_HASH = "QmTestHash123";

    event ProjectCreated(
        string indexed projectId,
        address indexed owner,
        string slug,
        string metadataHash,
        uint256 membershipTier
    );

    function setUp() public {
        registry = new ProjectRegistry(admin);
    }

    function test_CreateProject() public {
        vm.prank(user1);
        
        vm.expectEmit(true, true, false, true);
        emit ProjectCreated(PROJECT_ID, user1, SLUG, METADATA_HASH, 0);
        
        registry.createProject(PROJECT_ID, TITLE, SLUG, METADATA_HASH, 0);
        
        // Verify project was created
        IProjectRegistry.ProjectInfo memory project = registry.getProject(PROJECT_ID);
        assertEq(project.projectId, PROJECT_ID);
        assertEq(project.title, TITLE);
        assertEq(project.slug, SLUG);
        assertEq(project.owner, user1);
        assertEq(project.metadataHash, METADATA_HASH);
        assertEq(project.membershipTier, 0);
        assertTrue(project.isActive);
        
        // Verify slug mapping
        IProjectRegistry.ProjectInfo memory projectBySlug = registry.getProjectBySlug(SLUG);
        assertEq(projectBySlug.projectId, PROJECT_ID);
        
        // Verify ownership
        assertTrue(registry.isProjectOwner(PROJECT_ID, user1));
        assertFalse(registry.isProjectOwner(PROJECT_ID, user2));
        
        // Verify totals
        assertEq(registry.totalProjects(), 1);
        assertEq(registry.getOwnerProjectCount(user1), 1);
    }

    function test_CreateProject_DuplicateId() public {
        vm.prank(user1);
        registry.createProject(PROJECT_ID, TITLE, SLUG, METADATA_HASH, 0);
        
        vm.prank(user2);
        vm.expectRevert(IProjectRegistry.ProjectAlreadyExists.selector);
        registry.createProject(PROJECT_ID, "Different Title", "different-slug", "DifferentHash", 0);
    }

    function test_CreateProject_DuplicateSlug() public {
        vm.prank(user1);
        registry.createProject(PROJECT_ID, TITLE, SLUG, METADATA_HASH, 0);
        
        vm.prank(user2);
        vm.expectRevert(IProjectRegistry.SlugAlreadyTaken.selector);
        registry.createProject("different-id", "Different Title", SLUG, "DifferentHash", 0);
    }

    function test_CreateProject_InvalidMembershipTier() public {
        vm.prank(user1);
        vm.expectRevert(IProjectRegistry.InvalidMembershipTier.selector);
        registry.createProject(PROJECT_ID, TITLE, SLUG, METADATA_HASH, 999);
    }

    function test_UpdateProject() public {
        vm.prank(user1);
        registry.createProject(PROJECT_ID, TITLE, SLUG, METADATA_HASH, 0);
        
        string memory newMetadataHash = "QmNewHash456";
        
        vm.prank(user1);
        registry.updateProject(PROJECT_ID, newMetadataHash);
        
        IProjectRegistry.ProjectInfo memory project = registry.getProject(PROJECT_ID);
        assertEq(project.metadataHash, newMetadataHash);
    }

    function test_UpdateProject_UnauthorizedAccess() public {
        vm.prank(user1);
        registry.createProject(PROJECT_ID, TITLE, SLUG, METADATA_HASH, 0);
        
        vm.prank(user2);
        vm.expectRevert(IProjectRegistry.UnauthorizedAccess.selector);
        registry.updateProject(PROJECT_ID, "NewHash");
    }

    function test_UpdateSlug() public {
        vm.prank(user1);
        registry.createProject(PROJECT_ID, TITLE, SLUG, METADATA_HASH, 0);
        
        string memory newSlug = "new-slug";
        
        vm.prank(user1);
        registry.updateSlug(PROJECT_ID, newSlug);
        
        IProjectRegistry.ProjectInfo memory project = registry.getProject(PROJECT_ID);
        assertEq(project.slug, newSlug);
        
        // Verify old slug is no longer mapped
        vm.expectRevert(IProjectRegistry.ProjectNotFound.selector);
        registry.getProjectBySlug(SLUG);
        
        // Verify new slug works
        IProjectRegistry.ProjectInfo memory projectByNewSlug = registry.getProjectBySlug(newSlug);
        assertEq(projectByNewSlug.projectId, PROJECT_ID);
    }

    function test_DeactivateProject() public {
        vm.prank(user1);
        registry.createProject(PROJECT_ID, TITLE, SLUG, METADATA_HASH, 0);
        
        vm.prank(user1);
        registry.deactivateProject(PROJECT_ID);
        
        IProjectRegistry.ProjectInfo memory project = registry.getProject(PROJECT_ID);
        assertFalse(project.isActive);
        
        // Verify slug is removed
        vm.expectRevert(IProjectRegistry.ProjectNotFound.selector);
        registry.getProjectBySlug(SLUG);
    }

    function test_SlugAvailability() public {
        assertTrue(registry.isSlugAvailable(SLUG));
        
        vm.prank(user1);
        registry.createProject(PROJECT_ID, TITLE, SLUG, METADATA_HASH, 0);
        
        assertFalse(registry.isSlugAvailable(SLUG));
        assertTrue(registry.isSlugAvailable("different-slug"));
    }

    function test_GetProjectsByOwner() public {
        // Create multiple projects
        vm.startPrank(user1);
        registry.createProject("project-1", "Title 1", "slug-1", "hash-1", 0);
        registry.createProject("project-2", "Title 2", "slug-2", "hash-2", 1);
        registry.createProject("project-3", "Title 3", "slug-3", "hash-3", 0);
        vm.stopPrank();
        
        // Test pagination
        IProjectRegistry.ProjectInfo[] memory projects = registry.getProjectsByOwner(user1, 0, 2);
        assertEq(projects.length, 2);
        
        projects = registry.getProjectsByOwner(user1, 1, 2);
        assertEq(projects.length, 2);
        
        projects = registry.getProjectsByOwner(user1, 3, 2);
        assertEq(projects.length, 0);
        
        // Test count
        assertEq(registry.getOwnerProjectCount(user1), 3);
    }

    function test_MembershipTierLimits() public {
        vm.startPrank(user1);
        
        // Create 3 free tier projects (limit)
        registry.createProject("free-1", "Free 1", "free-1", "hash-1", 0);
        registry.createProject("free-2", "Free 2", "free-2", "hash-2", 0);
        registry.createProject("free-3", "Free 3", "free-3", "hash-3", 0);
        
        // Try to create 4th free tier project (should fail)
        vm.expectRevert("Project limit exceeded for tier");
        registry.createProject("free-4", "Free 4", "free-4", "hash-4", 0);
        
        vm.stopPrank();
    }

    function test_ProjectNotFound() public {
        vm.expectRevert(IProjectRegistry.ProjectNotFound.selector);
        registry.getProject("non-existent");
        
        vm.expectRevert(IProjectRegistry.ProjectNotFound.selector);
        registry.getProjectBySlug("non-existent");
    }

    function test_AdminDeactivateProject() public {
        vm.prank(user1);
        registry.createProject(PROJECT_ID, TITLE, SLUG, METADATA_HASH, 0);
        
        vm.prank(admin);
        registry.adminDeactivateProject(PROJECT_ID);
        
        IProjectRegistry.ProjectInfo memory project = registry.getProject(PROJECT_ID);
        assertFalse(project.isActive);
    }

    function test_PauseUnpause() public {
        vm.prank(admin);
        registry.pause();
        
        vm.prank(user1);
        vm.expectRevert("Pausable: paused");
        registry.createProject(PROJECT_ID, TITLE, SLUG, METADATA_HASH, 0);
        
        vm.prank(admin);
        registry.unpause();
        
        vm.prank(user1);
        registry.createProject(PROJECT_ID, TITLE, SLUG, METADATA_HASH, 0);
        
        IProjectRegistry.ProjectInfo memory project = registry.getProject(PROJECT_ID);
        assertTrue(project.isActive);
    }
}