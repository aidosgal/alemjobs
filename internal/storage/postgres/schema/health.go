package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/mixin"
)

type Health struct {
	ent.Schema
}

func (Health) Fields() []ent.Field {
	return []ent.Field{
		field.String("status").Default("ok"),
	}
}

func (Health) Edges() []ent.Edge {
	return nil
}

func (Health) Indexes() []ent.Index {
	return nil
}

func (Health) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.Time{},
	}
}
