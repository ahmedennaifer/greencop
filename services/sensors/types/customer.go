package types

type CustomerRegister struct {
	Username string `yaml:"username"`
	Email    string `yaml:"email"`
	password string `yaml:"password"`
}

type CustomerExists struct {
	New bool `yaml:"new"`
	Id  int  `yaml:"id"`
}

type CustomerResponse struct {
	Id       int
	Username string
	Email    string
	Rooms    []int
}
