
import Pixi from 'pixi.js'
import P2 from 'p2'
import { Vector2, toRadians, toDegrees, wrap } from 'mathutil'

import PhysicalEntity from 'entities/physical'

// @TODO only for registering debug info
import appState from 'stores/appState'

function updateDebug( obj ) {
    // These are expensive for cycles, not sure its going to work like this
    appState.get().cursor([ 'main', 'debug' ]).update( cursor => {
        return cursor.merge( obj )
    })
}


/**
 * User data should be bounced back to the appState, but, benchmark it once there
 * are some tick updates updating the physics
 */
export default class User extends PhysicalEntity {
    constructor() {
        super({
            radius: 10,
            mass: 2
        })

        this.turnThrust = .25
        this.thrust = 150
        this.bankThrust = 50

        this.position[1] = 80
        this.angularDamping = .75

        this.damping = .1


        // @TODO replace with sprite
        this.ship = new Pixi.Graphics()
        this.container.addChild( this.ship )

        this.update()
        this._drawShip()
    }

    _drawShip() {
        this.ship.beginFill( 0x040414 )
        this.ship.lineStyle( 1, 0xb3e5fc, 1 )
        this.ship.arc(
            0,
            0,
            this.radius * .5,
            toRadians( 220 ), toRadians( 320 ), false
        )
        this.ship.lineTo( 0, this.radius * .75 )
        this.ship.endFill()
    }

    update() {
        super()

        // update this debug info
        updateDebug({
            'user': {
                'px': this.position[ 0 ].toFixed( 2 ),
                'py': this.position[ 1 ].toFixed( 2 ),
                'pa': wrap( toDegrees( this.angle ), 0, 360 ).toFixed( 2 ),
                'vx': this.body.velocity[ 0 ].toFixed( 4 ),
                'vy': this.body.velocity[ 1 ].toFixed( 4 ),
                'va': this.body.angularVelocity.toFixed( 4 ),
                'fx': this.body.force[ 0 ].toFixed( 6 ),
                'fy': this.body.force[ 1 ].toFixed( 6 )
            }
        })

        this.ship.position.set( ...this.position )
        this.ship.rotation = this.angle
    }

    forward = () => {
        // Use force local to account for body rotation
        // Apply force from behind the craft, simulating a single engine mounted
        // centrally at the back of the craft
        this.body.applyForceLocal( [ 0, this.thrust ], [ 0, -1 ] )
    }

    backward = () => {
        // @TODO
    }

    left = () => {
        this.body.angularVelocity = -this.turnThrust
    }

    right = () => {
        this.body.angularVelocity = this.turnThrust
    }

    // Banking is almost like strafing, but results in a slight opposite turn as well
    // The slight offset implies the banking thrusters are located behind the
    // center of gravity, which accounts for the slight turn imparted
    bankLeft = () => {
        this.body.applyForceLocal( [ this.bankThrust, 0 ], [ 0, -1 ] )
    }
    bankRight = () => {
        this.body.applyForceLocal( [ -this.bankThrust, 0 ], [ 0, -1 ] )
    }
}
