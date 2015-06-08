public enum MembershipTypes
{
    NotSignedUp = 0,
    Basic = 1,
    Advance = 2,
    Manager = 3
}

public enum InterestTypes
{
    Sell = 1,
    Buy = 2
}

public enum BidTypes
{
    Unknown = 0,
    Indicative = 1,
    Firm = 2,
    RequestIndicative = 3,
    RequestFirm = 4,
    FillOrder = 5,
    OrderPlaced = 6
}

public enum GUIDTypes
{
    Session,
    Interest,
    Contact,
    Email,
    Bid
}

public enum EmailVerificationStatuses
{
    EmailNotFound=0,
    EmailNotVerified=1,
    EmailVerified=2
}

public enum NotificationTypes
{
    ReceiveOfflineMessage = 1,
    NewContactsAddMe = 2,
    UserFillsOrder = 3,
    NewInterest = 4,
    RequestPrice = 5,
    LeaveOrder = 6
}