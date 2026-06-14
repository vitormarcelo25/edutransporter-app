package io.github.David_Rn01.API_OFC.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.br.CPF;

@Entity
@Table(name = "motorista")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Motorista {
    @Id
    @CPF(message = "CPF Invalido")
    private String cpf;

    @Column(length = 50)
    private String nome;

    @Column(length = 17)
    private String numeroCelular;

    @Column
    private String senha;

    @Column
    private String carteiraConducao;

    @ManyToOne
    @JoinColumn(name = "cidade_id")
    private Cidade cidade;
}
