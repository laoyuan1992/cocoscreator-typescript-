import Singleton from "../Common/Function/Singleton";

class RoomCostConfig extends Singleton
{
// 消耗表
    private RoomCostTable = {

        34    : {room_type : "GD_XJ",  consume_item:"5009001", game_count:"1", consume_count:"3", name:"掼蛋私房经典消耗"  },
        35    : {room_type : "GD_XJ",  consume_item:"5009001", game_count:"4", consume_count:"2", name:"掼蛋私房团团转消耗"},
        36    : {room_type : "GD_XJ",  consume_item:"5009001", game_count:"8", consume_count:"3", name:"掼蛋私房团团转消耗"},
        37    : {room_type : "GD_XJ",  consume_item:"5009001", game_count:"16", consume_count:"6", name:"掼蛋私房团团转消耗"},
    }

    //获取消耗表
    public GetCostTable( CostID : number )
    {
        if(this.RoomCostTable[CostID])
        {
            return this.RoomCostTable[CostID];
        }
        return null;
    }

    //获取游戏局数
    public GetGameCount( CostID : number ) : number
    {
        if(this.RoomCostTable[CostID] == null)
        {
            return 0;
        }
        return parseInt( (this.RoomCostTable[CostID].game_count) )
    }

    //根据RoomType获取游戏局数
    public GetGameCountByRoomType( RoomType : string ) : number
    {
        for (const key in this.RoomCostTable) {
            if (this.RoomCostTable.hasOwnProperty(key)) {
                const element = this.RoomCostTable[key];
                if( element.room_type == RoomType )
                {
                    return parseInt(element.game_count);
                }
            }
        }
        return 0;
    }

    //获取游戏消耗数量
    public GetGameCost( CostID : number ) : number
    {
        if(this.RoomCostTable[CostID] == null)
        {
            return 0;
        }
        return parseInt( (this.RoomCostTable[CostID].consume_count) )
    }
}

export default RoomCostConfig.GetInstance();

