export class InvincibleComponent {
  private static INVINCIBLE_TIME = 1

  private invincibleTime = 0

  public setInvincible(time = InvincibleComponent.INVINCIBLE_TIME): void {
    this.invincibleTime = time
  }

  public decreaseTime(delta: number): void {
    this.invincibleTime -= delta
  }

  public getTime(): number {
    return this.invincibleTime
  }

  public isInvincible(): boolean {
    return this.invincibleTime > 0
  }
}
