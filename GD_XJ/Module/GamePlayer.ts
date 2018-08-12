import GameDefine from "./GameDefine";
import LinkedList from "../../Common/DataStruct/LinkedList";
import NetManager from "../../Common/Net/NetManager";
import GameCard from "./GameCard";

export default class GamePlayer
{
    private mID          : number     = 0;                             //ID
    private mPlayerBase  : any        = null;                          //数据
    private mHandNum     : number     = 0;                             //手牌数量
    private mState       : number     = 0;                             //状态
    private mGameSeats   : number     = GameDefine.GameSeats[1];       //座位
    private mHandCardList: LinkedList = new LinkedList();              //手牌
    private mScore       : number     = 0;                             //成绩
    private mTotalScore  : number     = 0;                             //总成绩
    private mTeam        : number     = 0;                             //队伍
    private mSeries      : number     = GameDefine.InitSeries          //级别
    private mUserName    : string     = "";                            //UserName

    public constructor( Data :any | null )
    {
        this.RefreshData(Data);
    }

    public RefreshData( PlayerData : any )
    {
        if ( PlayerData == null ) return;
        this.mHandCardList.Clear();
        this.mID            = PlayerData.player_base.pid;
        this.mHandNum       = PlayerData.hand_count;
        this.mState         = PlayerData.state;
        this.mGameSeats     = PlayerData.seats;
        this.mPlayerBase    = PlayerData.player_base;
        this.mSeries        = PlayerData.series;
        this.mTeam          = PlayerData.team;
        this.mUserName      = PlayerData.player_base.username;
        this.mTotalScore    = PlayerData.score;
    }

    // 是否准备
    public IsReady() : boolean
    {
        let ProtoBuf = NetManager.GetProtobuf();
        return (this.mState & ProtoBuf.TGuanDanRoleState.STATE_GUANDAN_READY ) == ProtoBuf.TGuanDanRoleState.STATE_GUANDAN_READY ? true : false;
    }

    // 是否新角色
    public IsNewRole() : boolean
    {
        let ProtoBuf = NetManager.GetProtobuf();
        return (this.mState & ProtoBuf.TGuanDanRoleState.STATE_GUANDAN_NEWROLE ) == ProtoBuf.TGuanDanRoleState.STATE_GUANDAN_NEWROLE ? true : false;
    }

    // 是否离线
    public IsOnline() : boolean
    {
        let ProtoBuf = NetManager.GetProtobuf();
        return (this.mState & ProtoBuf.TGuanDanRoleState.STATE_GUANDAN_OFFLINE ) == ProtoBuf.TGuanDanRoleState.STATE_GUANDAN_OFFLINE ? true : false;
    }

    // 是否房主
    public IsOwenrRoom(): boolean
    {
        let ProtoBuf = NetManager.GetProtobuf();
        return (this.mState & ProtoBuf.TGuanDanRoleState.STATE_GUANDAN_ROOM_MASTER ) == ProtoBuf.TGuanDanRoleState.STATE_GUANDAN_ROOM_MASTER ? true : false;
    }

    //是否解散
    public IsRelieve() : boolean
    {
        let ProtoBuf = NetManager.GetProtobuf();
        return (this.mState & ProtoBuf.TGuanDanRoleState.STATE_GUANDAN_APPLY_DISS ) == ProtoBuf.TGuanDanRoleState.STATE_GUANDAN_APPLY_DISS ? true : false;
    }

    // 是否限制开始
    public IsLimitStart(): boolean
    {
        let ProtoBuf = NetManager.GetProtobuf();
        return (this.mState & ProtoBuf.TGuanDanRoleState.STATE_GUANDAN_LIMIT ) == ProtoBuf.TGuanDanRoleState.STATE_GUANDAN_LIMIT ? true : false;
    }

    //刷新角色状态
    public RefreshRoleState( State : number )
    {
        this.mState = State;
    }

    //删除用户状态
    public RemoveRoleState( State : number )
    {
        let Mask = 0;
        Mask = (~Mask)^State;
        this.mState &= Mask;
    }

    //添加角色状态
    public AddRoleState( State : number )
    {
        this.mState |= State;
    }

    //获取玩家手牌数量
    public GetHandNum() : number
    {
        return this.mHandNum;
    }

    //设置玩家手牌数量
    public SetHandNum( Num : number )
    {
        this.mHandNum = Num;
    }

    // 获取玩家座位
    public GetGameSeats() : number
    {
        return this.mGameSeats;
    } 

    // 设置座位
    public SetGameSeats( Seats : number )
    {
        this.mGameSeats = Seats;
    }

    // 设置成绩
    public SetScore( Score : number )
    {
        this.mScore = Score;
    }

    // 获得成绩
    public GetScore() : number
    {
        return this.mScore;
    }

    // 获取级别
    public GetSeries() : number
    {
        return this.mSeries;
    }

    // 设置级别
    public SetSeries( Series : number )
    {
        this.mSeries = Series;
    }

    //刷新Playerbase
    public RefreshPlayerBase()
    {
        this.mID =  this.mPlayerBase.pid;
        this.mUserName = this.mPlayerBase.username;
    }

    public GetUserName() : string
    {
        return this.mUserName;
    }

    //添加一张用户手牌 并返回这个牌
    public AddHandCard( Card : any ) : GameCard
    {
        if ( 0 == Card ) return;
        let HandCard = new GameCard( Card.card );
        this.mHandCardList.Push( HandCard );

        return HandCard;
    }

    // 添加一组手牌 ( CardList 为数组 )
    public AddHandCardList( CardList )
    {
        this.mHandCardList.Clear();
        for ( let idx = 0 ; idx < CardList.length ; idx ++ )
        {
            let HandCard = new GameCard( CardList[idx].card );
            this.mHandCardList.Push( HandCard );
        }
    }

    //添加回放手牌
    public AddRecordHandCardList( CardList )
    {
        this.mHandCardList.Clear();
        for( let i = 0;i<CardList.length;i++)
        {
            let CardData = new GameCard(CardList[i]);
            this.mHandCardList.Push(CardData);
        }
    }

    // 添加一组手牌 ( CardList 为LinkedList )
    public AddHandCardListEx( CardList : LinkedList )
    {
        this.mHandCardList.Clear();
        CardList.ForEach((item)=> {
            let HandCard = new GameCard( item.card );
            this.mHandCardList.Push( HandCard );
        });
    }   

    //获取一个手牌信息( 下标从1 开始 )
    public GetHandCard( Idx : number ) : GameCard
    {   
        if ( Idx < 1|| Idx > this.mHandCardList.GetCount() )
        {
            return;
        }
        return this.mHandCardList.Get(Idx);
    }

    // 删除手牌
    public RemoveHandCard( CardInfo : GameCard )
    {
        //先以Index优先
        for ( let idx = this.mHandCardList.GetCount() ; idx > 0; idx--  )
        {
            let Card : GameCard = this.mHandCardList.Get( idx );
            if ( Card.Index == CardInfo.Index )
            {
                this.mHandCardList.RemoveByIndex( idx );
                return;
            }
        } 

        for ( let idx = this.mHandCardList.GetCount() ; idx > 0; idx--  )
        {
            let Card : GameCard = this.mHandCardList.Get( idx );
            if ( Card.Card == CardInfo.Card )
            {
                this.mHandCardList.RemoveByIndex( idx );
                return;
            }
        }
    }

     // 删除手牌
     public RemoveHandCardByValue( CardInfo : GameCard )
     {
         for ( let idx = this.mHandCardList.GetCount() ; idx > 0; idx--  )
         {
             let Card : GameCard = this.mHandCardList.Get( idx );
             if ( Card == CardInfo )
             {
                 this.mHandCardList.RemoveByIndex( idx );
                 return;
             }
         }
     }  

     // 获取所有手牌数量
     public GetHandCardCount() : number
     {
         return this.mHandCardList.GetCount();
     }

     // 获取总成绩
     public GetTotalScore(): number
     {
        return this.mTotalScore;
     }

     // 设置总成绩
     public SetTotalScore( Score : number )
     {
        this.mTotalScore =  Score;
     }

     // 获取队伍
     public GetTeam(): number
     {
        return this.mTeam;
     }

     // 获取ID
     public GetPID(): number
     {
        return this.mID;
     }

     // 设置ID
     public SetPID( ID : number )
     {
        this.mID = ID;
     }

     // 重新刷新牌的索引
     public RefreshHandCardIndex()
     {
        for ( let idx = 1 ; idx <= this.mHandCardList.GetCount() ; idx ++ )
        {
            this.mHandCardList.Get( idx ).Index = idx;
        }
     }

     public get HandCardList() : LinkedList { return this.mHandCardList; }
    
}
