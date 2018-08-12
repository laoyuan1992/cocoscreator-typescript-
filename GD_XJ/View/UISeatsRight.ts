import UISeatsBase from "./UISeatsBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UISeatsRight extends UISeatsBase
{

    public GetRiverEndPos() : cc.Vec2
    {
        return new cc.Vec2( 300, 130 );
    }

    public GetRiverInitPos() : cc.Vec2
    {
        return new cc.Vec2( 580, 130 );
    }
}
