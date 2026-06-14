package io.github.David_Rn01.API_OFC.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.br.CPF;

@Entity
@Table(name = "aluno")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Aluno {

    @Id
    @CPF(message = "CPF inválido")
    @Column(length = 14)
    private String cpf;

    @Column(length = 50)
    private String nome;

    @Column(length = 17)
    private String numeroCelular;

    @Column
    private String Senha;

    @ManyToOne
    @JoinColumn(name = "cidade_id")
    private Cidade cidade;

    @ManyToOne
    @JoinColumn(name = "faculdade_id")
    private Faculdade faculdade;

    @Override
    public String toString() {
        return "Aluno{" +
                "cpf='" + cpf + '\'' +
                ", nome='" + nome + '\'' +
                ", numeroCelular='" + numeroCelular + '\'' +
                ", Senha='" + Senha + '\'' +
                ", cidade=" + cidade +
                ", faculdade=" + faculdade +
                '}';
    }
}
