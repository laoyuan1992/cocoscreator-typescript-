import UISeatsBase from "./UISeatsBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UISeatsLeft extends UISeatsBase
{
    public GetRiverEndPos() : cc.Vec2
    {
        return new cc.Vec2( 230, 130 );
    }

    public GetRiverInitPos() : cc.Vec2
    {
        return new cc.Vec2( -65, 165 );
    }
}
