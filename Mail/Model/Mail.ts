///////////////////////////////////////////////////
//                   邮件数据                     //
///////////////////////////////////////////////////
import NetManager from "../../Common/Net/NetManager";

export default class Mail 
{
    private mMailID     : number    = 0;
    private mSendTime   : number    = 0;
    private mTitle      : string    = "";
    private mContent    : string    = "";
    private mMailKind   : number    = 0;
    private mItemID     : number    = 0;
    private mItemNums   : number    = 0;
    private mIsPrivate  : boolean   = false;
    private mIsRecvState: boolean   = false; 

    //是否是自动领取类型
    public IsAutoMailKind()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        return this.mMailKind == ProtoBuf.TMailType.TYPE_SYSTEM_AUTOPEN;
    }

    //是否是道具
    public IsItemReward()
    {
        if( null == this.mItemID || null == this.mItemNums )
        {
            return false;
        }
        return ( this.mItemID > 0 && this.mItemNums > 0 );
    }


    public get RecvState()      : boolean       {  return this.mIsRecvState;            }
    public get MailID()         : number        {  return this.mMailID;                 }
    public get MailKind()       : number        {  return this.mMailKind;               }
    public get Content()        : string        {  return this.mContent;                }
    public get Title()          : string        {  return this.mTitle;                  }
    public get ItemID()         : number        {  return this.mItemID;                 }
    public get SendTime()       : number        {  return this.mSendTime;               }
    public get ItemNums()       : number        {  return this.mItemNums;               }
    public get IsPrivate()      : boolean       {  return this.mIsPrivate;              }

    public set MailID   ( Num   : number )       {   this.mMailID       = Num;           }    
    public set SendTime ( Num   : number )       {   this.mSendTime     = Num;           } 
    public set Title    ( Str   : string )       {   this.mTitle        = Str;           }
    public set Content  ( Str   : string )       {   this.mContent      = Str;           }
    public set MailKind ( Num   : number )       {   this.mMailKind     = Num;           }
    public set ItemID   ( Num   : number )       {   this.mItemID       = Num;           }
    public set ItemNums ( Num   : number )       {   this.mItemNums     = Num;           } 
    public set IsPrivate( State : boolean)       {   this.mIsPrivate    = State;         }     
    public set RecvState( State : boolean)       {   this.mIsRecvState  = State;         } 
}
