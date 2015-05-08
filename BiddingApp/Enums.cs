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
    FillOrder = 5
}

public enum GUIDTypes
{
    Session,
    Interest,
    Contact,
    Email,
    Bid
}