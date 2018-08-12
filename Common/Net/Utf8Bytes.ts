/************************************************************
 * 作者: sunny
 * 功能：字节流转换
 ************************************************************/
export default class Utf8Bytes
{
    private EofByte         : number = -1;
    private EofCodePoint    : number = -1;

    static EnCode( str:string )         { return new Utf8Bytes().EnCode(str) }
    static DeCode( data:Uint8Array )    { return new Utf8Bytes().DeCode( data ); }

    private EncoderError( CodePoint:number )
    {
        console.error( "UTF8 encoderError" , CodePoint );
    }

    private DecoderError( Fatal:boolean , OptCodePoint ?: number ) : number
    {
        if ( Fatal ) console.error( "UTF8 decoderError" , OptCodePoint );
        return OptCodePoint || 0xFFFD;
    }

    private IsRange( a:number , min:number , max:number ) { return min <= a && a <= max; }

    private Div( n:number , d:number ) { return Math.floor( n/d ); }

    private StringToCodePoints( string:string )
    {
        let cps = [];
        let i = 0 , n = string.length;
        while ( i < string.length )
        {
            let c = string.charCodeAt( i );
            if ( !this.IsRange( c, 0xD800, 0xDFFF )) { cps.push( c ); }
            else if ( this.IsRange( c, 0xDC00, 0xDFFF )) { cps.push(0xFFFD); }
            else
            {
                if ( i == n-1 ) { cps.push(0xFFFD); }
                else
                {
                    let d = string.charCodeAt( i+1 );
                    if ( this.IsRange( d, 0xDC00, 0xDFFF )) {
                        let a = c & 0x3FF;
                        let b = d & 0x3FF;
                        i += 1;
                        cps.push( 0x10000 + (a << 10) + b );
                    } else {
                        cps.push( 0xFFFD );
                    }
                }
            }
            i += 1;
        }
        return cps;
    }

    private EnCode( str:string ) : Uint8Array 
    {
        let pos : number = 0;
        let CodePoint = this.StringToCodePoints( str );
        let OutPutBytes = [];
        
        while ( CodePoint.length > pos )
        {
            let code:number = CodePoint[pos++];
            if ( this.IsRange( code , 0xD800, 0xDFFF ))
            {
                this.EncoderError( code );
            }
            else if ( this.IsRange( code , 0x0000, 0x007f )) 
            {
                OutPutBytes.push( code );
            }
            else
            {
                let count = 0 , offset = 0;
                if ( this.IsRange( code , 0x0080, 0x07FF) ) 
                {
                    count  = 1;
                    offset = 0xC0;
                } else if ( this.IsRange( code , 0x0800, 0xFFFF )) 
                {
                    count  = 2;
                    offset = 0xE0;
                } else if ( this.IsRange( code , 0x10000, 0x10FFFF )) 
                {
                    count  = 3;
                    offset = 0xF0;
                }

                OutPutBytes.push( this.Div( code , Math.pow(64,count)) + offset );

                while ( count > 0 ) 
                {
                    let temp = this.Div( code , Math.pow(64,count-1));
                    OutPutBytes.push( 0x80 + (temp % 64) );
                    count-=1;
                }
            }
        }
        return new Uint8Array( OutPutBytes );
    }

    private DeCode( data:Uint8Array ) : string
    {
        let Fatal       : boolean = false;
        let Pos         : number  = 0;
        let Result      : string  = "";
        let CodePoint;
        let Utf8CodePoint       = 0;
        let Utf8BytesNeeded     = 0;
        let Utf8BytesSeen       = 0;
        let Utf8LowerBounDary   = 0;

        while ( data.length > Pos )
        {
            let  temp_type = data[Pos++];
            if ( temp_type == this.EofByte )
            {
                if ( Utf8BytesNeeded != 0 ) { CodePoint = this.DecoderError(Fatal); }
                else { CodePoint = this.EofCodePoint; }
            }
            else
            {
                if ( Utf8BytesNeeded == 0 )
                {
                    if ( this.IsRange( temp_type , 0x00, 0x7F )) { CodePoint = temp_type; }
                    else 
                    {
                        if ( this.IsRange( temp_type , 0xC2, 0xDF )) 
                        {
                            Utf8BytesNeeded     = 1;
                            Utf8LowerBounDary   = 0x80;
                            Utf8CodePoint       = temp_type - 0xC0;
                        } else if ( this.IsRange( temp_type , 0xE0, 0xEF ) ) {
                            Utf8BytesNeeded     = 2;
                            Utf8LowerBounDary   = 0x800;
                            Utf8CodePoint       = temp_type - 0xE0;
                        } else if ( this.IsRange( temp_type , 0xF0, 0xF4 )) {
                            Utf8BytesNeeded     = 3;
                            Utf8LowerBounDary   = 0x10000;
                            Utf8CodePoint       = temp_type - 0xF0;
                        } else {
                            this.DecoderError( Fatal );
                        }

                        Utf8CodePoint = Utf8CodePoint * Math.pow( 64 , Utf8BytesNeeded );
                        CodePoint = null;
                    }
                } 
                else if ( this.IsRange( temp_type , 0x80, 0xBF )) 
                {
                    Utf8CodePoint       = 0;
                    Utf8BytesNeeded     = 0;
                    Utf8BytesSeen       = 0;
                    Utf8LowerBounDary   = 0;
                    Pos--;
                    CodePoint = this.DecoderError( Fatal );
                }
                else
                {
                    Utf8BytesSeen += 1;
                    Utf8CodePoint = Utf8CodePoint + (temp_type-0x80) * Math.pow( 64 , Utf8BytesNeeded - Utf8BytesSeen );
                    if ( Utf8BytesSeen !== Utf8BytesNeeded )
                    {
                        CodePoint = null;
                    } 
                    else 
                    {
                        let cp = Utf8CodePoint;
                        let LowerBounDary = Utf8LowerBounDary;
                        Utf8CodePoint       = 0;
                        Utf8BytesNeeded     = 0;
                        Utf8BytesSeen       = 0;
                        Utf8LowerBounDary   = 0;
                        if ( this.IsRange(cp , LowerBounDary , 0x10FFFF) && !this.IsRange(cp , 0xD800, 0xDFFF )) {
                            CodePoint = cp;
                        }
                        else {
                            CodePoint = this.DecoderError(Fatal , temp_type);
                        }
                    }
                }
            }

            if ( CodePoint !== null && CodePoint !== this.EofCodePoint )
            {
                if ( CodePoint <= 0xFFFF ) { 
                    if ( CodePoint > 0 ) { Result += String.fromCharCode(CodePoint) ;}
                }
                else {
                    CodePoint -= 0x10000;
                    Result += String.fromCharCode( 0xD800 + ((CodePoint >> 10) & 0x3ff ));
                    Result += String.fromCharCode( 0xDC00 + (CodePoint&0x3ff));
                }
            }
        }

        return Result;
    }
}
