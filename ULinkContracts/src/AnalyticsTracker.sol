// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IAnalyticsTracker.sol";
import "./interfaces/IProjectRegistry.sol";

/// @title ULink Analytics Tracker
/// @notice On-chain analytics tracking for ULink projects
/// @dev Tracks page views, link clicks, and shares on Base blockchain
contract AnalyticsTracker is IAnalyticsTracker, AccessControl, ReentrancyGuard, Pausable {
    /// @notice Role for analytics management
    bytes32 public constant ANALYTICS_MANAGER_ROLE = keccak256("ANALYTICS_MANAGER_ROLE");
    
    /// @notice Role for emergency operations
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    /// @notice Reference to project registry
    IProjectRegistry public immutable projectRegistry;

    /// @notice Mapping from project ID to analytics
    mapping(string => ProjectAnalytics) private _projectAnalytics;

    /// @notice Mapping from project ID to events array
    mapping(string => AnalyticsEvent[]) private _projectEvents;

    /// @notice Mapping from project ID to visitor set tracking
    mapping(string => mapping(address => bool)) private _projectVisitors;

    /// @notice Mapping from project ID to unique visitor count
    mapping(string => uint256) private _uniqueVisitorCounts;

    /// @notice Mapping from visitor to their events
    mapping(address => AnalyticsEvent[]) private _visitorEvents;

    /// @notice Contract version
    string public constant VERSION = "1.0.0";

    /// @notice Maximum events to store per project (for gas optimization)
    uint256 public constant MAX_EVENTS_PER_PROJECT = 10000;

    /// @notice Event retention period (180 days)
    uint256 public constant EVENT_RETENTION_PERIOD = 180 days;

    modifier onlyValidProject(string calldata projectId) {
        // Check if project exists in registry
        try projectRegistry.getProject(projectId) returns (IProjectRegistry.ProjectInfo memory) {
            // Project exists, continue
        } catch {
            revert ProjectNotFound();
        }
        _;
    }

    modifier validEventType(string calldata eventType) {
        bytes32 eventHash = keccak256(bytes(eventType));
        if (
            eventHash != keccak256("view") &&
            eventHash != keccak256("click") &&
            eventHash != keccak256("share")
        ) {
            revert InvalidEventType();
        }
        _;
    }

    constructor(address admin, address _projectRegistry) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ANALYTICS_MANAGER_ROLE, admin);
        _grantRole(EMERGENCY_ROLE, admin);
        
        projectRegistry = IProjectRegistry(_projectRegistry);
    }

    /// @inheritdoc IAnalyticsTracker
    function trackPageView(
        string calldata projectId,
        string calldata metadata
    ) external nonReentrant whenNotPaused onlyValidProject(projectId) {
        _trackEvent(projectId, msg.sender, "view", "", metadata);
        
        // Update aggregated analytics
        ProjectAnalytics storage analytics = _projectAnalytics[projectId];
        analytics.projectId = projectId;
        analytics.totalViews++;
        analytics.lastUpdated = block.timestamp;

        // Track unique visitors
        if (!_projectVisitors[projectId][msg.sender]) {
            _projectVisitors[projectId][msg.sender] = true;
            _uniqueVisitorCounts[projectId]++;
            analytics.uniqueVisitors = _uniqueVisitorCounts[projectId];
        }

        emit PageView(projectId, msg.sender, block.timestamp, metadata);
        emit AnalyticsUpdated(
            projectId,
            analytics.totalViews,
            analytics.totalClicks,
            analytics.uniqueVisitors
        );
    }

    /// @inheritdoc IAnalyticsTracker
    function trackLinkClick(
        string calldata projectId,
        string calldata linkId,
        string calldata metadata
    ) external nonReentrant whenNotPaused onlyValidProject(projectId) {
        _trackEvent(projectId, msg.sender, "click", linkId, metadata);
        
        // Update aggregated analytics
        ProjectAnalytics storage analytics = _projectAnalytics[projectId];
        analytics.projectId = projectId;
        analytics.totalClicks++;
        analytics.lastUpdated = block.timestamp;

        // Track unique visitors
        if (!_projectVisitors[projectId][msg.sender]) {
            _projectVisitors[projectId][msg.sender] = true;
            _uniqueVisitorCounts[projectId]++;
            analytics.uniqueVisitors = _uniqueVisitorCounts[projectId];
        }

        emit LinkClick(projectId, linkId, msg.sender, block.timestamp, metadata);
        emit AnalyticsUpdated(
            projectId,
            analytics.totalViews,
            analytics.totalClicks,
            analytics.uniqueVisitors
        );
    }

    /// @inheritdoc IAnalyticsTracker
    function trackShare(
        string calldata projectId,
        string calldata platform
    ) external nonReentrant whenNotPaused onlyValidProject(projectId) {
        _trackEvent(projectId, msg.sender, "share", "", platform);

        emit ShareEvent(projectId, msg.sender, block.timestamp, platform);
    }

    /// @inheritdoc IAnalyticsTracker
    function getProjectAnalytics(string calldata projectId)
        external
        view
        returns (ProjectAnalytics memory)
    {
        return _projectAnalytics[projectId];
    }

    /// @inheritdoc IAnalyticsTracker
    function getProjectEvents(
        string calldata projectId,
        uint256 offset,
        uint256 limit
    ) external view returns (AnalyticsEvent[] memory events) {
        AnalyticsEvent[] storage projectEvents = _projectEvents[projectId];
        uint256 totalEvents = projectEvents.length;
        
        if (offset >= totalEvents) {
            return new AnalyticsEvent[](0);
        }
        
        uint256 end = offset + limit;
        if (end > totalEvents) {
            end = totalEvents;
        }
        
        uint256 resultLength = end - offset;
        events = new AnalyticsEvent[](resultLength);
        
        // Return events in reverse chronological order (newest first)
        for (uint256 i = 0; i < resultLength; i++) {
            events[i] = projectEvents[totalEvents - 1 - offset - i];
        }
    }

    /// @inheritdoc IAnalyticsTracker
    function getProjectEventCount(string calldata projectId)
        external
        view
        returns (uint256)
    {
        return _projectEvents[projectId].length;
    }

    /// @inheritdoc IAnalyticsTracker
    function getUniqueVisitorCount(string calldata projectId)
        external
        view
        returns (uint256)
    {
        return _uniqueVisitorCounts[projectId];
    }

    /// @inheritdoc IAnalyticsTracker
    function hasVisited(string calldata projectId, address visitor)
        external
        view
        returns (bool)
    {
        return _projectVisitors[projectId][visitor];
    }

    /// @inheritdoc IAnalyticsTracker
    function getEventsByVisitor(
        address visitor,
        uint256 offset,
        uint256 limit
    ) external view returns (AnalyticsEvent[] memory events) {
        AnalyticsEvent[] storage visitorEvents = _visitorEvents[visitor];
        uint256 totalEvents = visitorEvents.length;
        
        if (offset >= totalEvents) {
            return new AnalyticsEvent[](0);
        }
        
        uint256 end = offset + limit;
        if (end > totalEvents) {
            end = totalEvents;
        }
        
        uint256 resultLength = end - offset;
        events = new AnalyticsEvent[](resultLength);
        
        // Return events in reverse chronological order (newest first)
        for (uint256 i = 0; i < resultLength; i++) {
            events[i] = visitorEvents[totalEvents - 1 - offset - i];
        }
    }

    /// @notice Get analytics for multiple projects (batch operation)
    /// @param projectIds Array of project IDs
    /// @return analytics Array of project analytics
    function getBatchProjectAnalytics(string[] calldata projectIds)
        external
        view
        returns (ProjectAnalytics[] memory analytics)
    {
        analytics = new ProjectAnalytics[](projectIds.length);
        for (uint256 i = 0; i < projectIds.length; i++) {
            analytics[i] = _projectAnalytics[projectIds[i]];
        }
    }

    /// @notice Admin function to clean up old events
    /// @param projectId Project ID to clean up
    /// @param maxAge Maximum age in seconds
    function cleanupOldEvents(string calldata projectId, uint256 maxAge)
        external
        onlyRole(ANALYTICS_MANAGER_ROLE)
    {
        AnalyticsEvent[] storage events = _projectEvents[projectId];
        uint256 cutoffTime = block.timestamp - maxAge;
        
        // Find first event that's still valid (not too old)
        uint256 validStartIndex = 0;
        for (uint256 i = 0; i < events.length; i++) {
            if (events[i].timestamp >= cutoffTime) {
                validStartIndex = i;
                break;
            }
        }
        
        // Remove old events by shifting array
        if (validStartIndex > 0) {
            for (uint256 i = 0; i < events.length - validStartIndex; i++) {
                events[i] = events[validStartIndex + i];
            }
            
            // Reduce array size
            for (uint256 i = 0; i < validStartIndex; i++) {
                events.pop();
            }
        }
    }

    /// @notice Emergency pause
    function pause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }

    /// @notice Emergency unpause
    function unpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
    }

    /// @notice Reset analytics for a project (emergency function)
    /// @param projectId Project ID to reset
    function resetProjectAnalytics(string calldata projectId)
        external
        onlyRole(ANALYTICS_MANAGER_ROLE)
    {
        delete _projectAnalytics[projectId];
        delete _projectEvents[projectId];
        delete _uniqueVisitorCounts[projectId];
        
        // Note: Individual visitor mappings are not cleared for gas efficiency
        // They will be overwritten when visitors interact again
    }

    /// @notice Internal function to track an event
    function _trackEvent(
        string calldata projectId,
        address visitor,
        string memory eventType,
        string calldata linkId,
        string calldata metadata
    ) internal {
        AnalyticsEvent memory newEvent = AnalyticsEvent({
            projectId: projectId,
            visitor: visitor,
            eventType: eventType,
            linkId: linkId,
            timestamp: block.timestamp,
            metadata: metadata
        });

        // Add to project events (with size limit)
        AnalyticsEvent[] storage projectEvents = _projectEvents[projectId];
        if (projectEvents.length >= MAX_EVENTS_PER_PROJECT) {
            // Remove oldest event (FIFO)
            for (uint256 i = 0; i < projectEvents.length - 1; i++) {
                projectEvents[i] = projectEvents[i + 1];
            }
            projectEvents[projectEvents.length - 1] = newEvent;
        } else {
            projectEvents.push(newEvent);
        }

        // Add to visitor events
        _visitorEvents[visitor].push(newEvent);
    }
}