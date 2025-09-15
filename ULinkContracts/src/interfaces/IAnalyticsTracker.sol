// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

interface IAnalyticsTracker {
    /// @notice Analytics event structure
    struct AnalyticsEvent {
        string projectId;
        address visitor;
        string eventType; // "view", "click", "share"
        string linkId;    // For click events
        uint256 timestamp;
        string metadata;  // JSON metadata (device, location, etc.)
    }

    /// @notice Aggregated analytics structure
    struct ProjectAnalytics {
        string projectId;
        uint256 totalViews;
        uint256 totalClicks;
        uint256 uniqueVisitors;
        uint256 lastUpdated;
    }

    /// @notice Events
    event PageView(
        string indexed projectId,
        address indexed visitor,
        uint256 timestamp,
        string metadata
    );

    event LinkClick(
        string indexed projectId,
        string indexed linkId,
        address indexed visitor,
        uint256 timestamp,
        string metadata
    );

    event ShareEvent(
        string indexed projectId,
        address indexed sharer,
        uint256 timestamp,
        string platform
    );

    event AnalyticsUpdated(
        string indexed projectId,
        uint256 views,
        uint256 clicks,
        uint256 uniqueVisitors
    );

    /// @notice Errors
    error UnauthorizedAccess();
    error ProjectNotFound();
    error InvalidEventType();

    /// @notice Track a page view
    /// @param projectId Project identifier
    /// @param metadata JSON metadata string
    function trackPageView(
        string calldata projectId,
        string calldata metadata
    ) external;

    /// @notice Track a link click
    /// @param projectId Project identifier
    /// @param linkId Link identifier
    /// @param metadata JSON metadata string
    function trackLinkClick(
        string calldata projectId,
        string calldata linkId,
        string calldata metadata
    ) external;

    /// @notice Track a share event
    /// @param projectId Project identifier
    /// @param platform Platform where shared
    function trackShare(
        string calldata projectId,
        string calldata platform
    ) external;

    /// @notice Get aggregated analytics for a project
    /// @param projectId Project identifier
    /// @return Project analytics
    function getProjectAnalytics(string calldata projectId)
        external
        view
        returns (ProjectAnalytics memory);

    /// @notice Get analytics events for a project with pagination
    /// @param projectId Project identifier
    /// @param offset Pagination offset
    /// @param limit Maximum results
    /// @return events Array of analytics events
    function getProjectEvents(
        string calldata projectId,
        uint256 offset,
        uint256 limit
    ) external view returns (AnalyticsEvent[] memory events);

    /// @notice Get total event count for a project
    /// @param projectId Project identifier
    /// @return Total event count
    function getProjectEventCount(string calldata projectId)
        external
        view
        returns (uint256);

    /// @notice Get unique visitor count for a project
    /// @param projectId Project identifier
    /// @return Unique visitor count
    function getUniqueVisitorCount(string calldata projectId)
        external
        view
        returns (uint256);

    /// @notice Check if address has visited project
    /// @param projectId Project identifier
    /// @param visitor Visitor address
    /// @return True if visited
    function hasVisited(string calldata projectId, address visitor)
        external
        view
        returns (bool);

    /// @notice Get events by visitor
    /// @param visitor Visitor address
    /// @param offset Pagination offset
    /// @param limit Maximum results
    /// @return events Array of analytics events
    function getEventsByVisitor(
        address visitor,
        uint256 offset,
        uint256 limit
    ) external view returns (AnalyticsEvent[] memory events);
}